import {
  Color,
  InstancedMesh,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  Sprite,
  Vector3,
  type WebGLRenderer,
} from 'three';
import type { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Assets, Kit, Own, Uniforms } from './assets';
import { Rig, introSeconds } from './camera';
import { buildCity } from './city';
import { mapToWorld } from './geometry';
import { buildInteraction } from './interact';
import { buildTags } from './labels';
import type { Layout } from './level';
import type { SceneModel } from './model';
import { Pace, quality } from './pace';
import { Panels } from './panels';
import { buildPost } from './post';
import { buildShots, buildTallShots } from './shots';
import type { SignFonts } from './textures';
import { Lighting, ThemeSwitch } from './theme';
import { LineColors, isDay } from './tokens';
import { Wake } from './wake';

export type LoopOptions = {
  /** Layout of the scene (level.ts). */
  layout: Layout;
  /** Layer of the canvas (Station3D.astro). */
  host: HTMLElement;
  /** Hero map (NetworkMap.astro) and its pause button. */
  netmap: HTMLElement | null;
  pause: HTMLElement | null;
  model: SceneModel;
  renderer: WebGLRenderer;
  css: CSS2DRenderer;
  assets: Assets;
  fonts: SignFonts;
  own: Own;
  /** Called once the full level still runs too slowly at its lowest pixel ratio. */
  onSlow: () => void;
};

export type Loop = { stop: () => void };

/** Seconds into the opening shot the wake starts, and how long it takes to cross the city (wake.ts). */
const wakeFrom = 0.6;
const wakeSeconds = 5.4;

/**
 * Reflection of the water as a share of the canvas size in CSS pixels: half of it on a wide window; on a narrow one
 * 0.3 of the size in device pixels, never more than the canvas itself draws.
 */
function reflectionShare(layout: Layout, ratio: number): number {
  return layout === 'narrow' ? Math.min(0.3 * devicePixelRatio, ratio) : 0.5;
}

/** Frees the GPU memory of every mesh, instanced mesh, point cloud and sprite of the scene. */
function release(scene: Scene): void {
  scene.traverse((object) => {
    if (object instanceof Mesh || object instanceof Points) {
      object.geometry.dispose();
      (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
      if (object instanceof InstancedMesh) object.dispose();
    } else if (object instanceof Sprite) {
      object.material.dispose();
    }
  });
}

/**
 * Builds the city and draws it until stopped: the camera follows the page at the full level and holds the lite shot
 * otherwise; labels follow the camera. During the opening shot the city wakes up from the end (wake.ts); without one
 * (scrolled, paused) or in the light theme it is lit from the first frame. At the full level the pointer can pick a
 * line in the scene (interact.ts). It draws only while it can be seen (tab visible, page view rather than the JSON
 * view, and at the lite level the hero map on screen). The pause button of the hero map freezes the time of the scene
 * (trains, cars, magic, the drone's drift, bank and lean); paused, it draws again only when the page scrolls or
 * resizes, the theme changes or the pointer picks something. A theme change repaints the scene through the theme
 * switch, without building it again. Frames that take too long step the pixel ratio down; still too slow at the
 * lowest one, the full level gives way (onSlow).
 */
export function startLoop(options: LoopOptions): Loop {
  const { layout, host, netmap, pause, model, renderer, css, assets, fonts, own, onSlow } = options;
  const full = layout !== 'lite';
  const tier = quality[layout];
  const root = document.documentElement;
  const uniforms: Uniforms = {
    uTime: { value: 0 },
    uScale: { value: 1 },
    uWindow: { value: 0.6 },
    uStreet: { value: 1 },
    uDay: { value: 0 },
    fogColor: { value: new Color() },
    fogDensity: { value: 0 },
  };
  const theme = new ThemeSwitch();
  const colors = new LineColors(model.lines);
  const kit: Kit = { assets, uniforms, colors, theme, wake: new Wake(), own };
  const scene = new Scene();
  const lighting = new Lighting(scene, assets.env, tier.shadow);
  const at = mapToWorld(model);
  // A phone (narrow layout, lite level) keeps the cars to the roads round the trunk and the end.
  const city = buildCity(model, at, kit, fonts, !full, layout !== 'wide');
  const tags = buildTags(model, city.anchors, layout);
  scene.add(city.group, ...tags.objects);

  const camera = new PerspectiveCamera(full ? 30 : 34, 1, 0.3, 1000);
  const tall = layout === 'narrow' ? buildTallShots(model, at, city.metro) : null;
  const rig = new Rig(camera, buildShots(model, at, city.metro), tall, layout);
  // The platform panels over the scene, on a wide window only: the labels give way to them.
  const panels = layout === 'wide' ? new Panels() : null;
  const post = buildPost(renderer, scene, camera, tier.samples);
  const focus = new Vector3();
  const pace = new Pace(tier, full);

  let dirty = true;
  const interaction =
    layout === 'lite'
      ? null
      : buildInteraction({ layout, model, city, camera, rig, host, onChange: () => (dirty = true) });
  if (interaction) scene.add(interaction.card);

  const applyTheme = () => {
    const day = isDay();
    colors.read();
    uniforms.uDay.value = day ? 1 : 0;
    lighting.apply(day, renderer, uniforms);
    post.setDay(day);
    theme.apply(day);
    dirty = true;
  };

  const measure = () => {
    rig.measure();
    panels?.measure();
    dirty = true;
  };

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const share = reflectionShare(layout, pace.ratio);
    renderer.setPixelRatio(pace.ratio);
    renderer.setSize(width, height);
    post.setSize(width, height, pace.ratio);
    city.setSize(width * share, height * share);
    css.setSize(width, height);
    tags.setSize(width, height);
    rig.setSize(width, height);
    // Pixels a scene unit covers at distance 1, for the size of the point lights.
    uniforms.uScale.value = (height * pace.ratio) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    measure();
  };

  const pressed = () => pause?.getAttribute('aria-pressed') === 'true';
  let paused = pressed();
  rig.sway.steady = paused;
  let inView = true;
  let drawn = false;
  let frame = 0;
  let last = 0;
  // Time of the scene, frozen while paused; time into the opening shot, null once it is over or skipped.
  let time = 0;
  let intro: number | null = paused || scrollY > 10 ? null : 0;
  // The city is lit for good once the opening shot is over or skipped, or in the light theme.
  let awake = false;
  // Scroll of the last frame: the panels move with the page even while the camera holds still.
  let scrolled = scrollY;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    if (!paused) time += dt;
    if (intro !== null) {
      intro += dt;
      if (paused || intro >= introSeconds || (full && scrollY > 10)) intro = null;
    }
    const moving = rig.update(dt, time, intro);
    const easing = interaction?.update(dt) ?? false;
    if (panels && scrollY !== scrolled) {
      scrolled = scrollY;
      dirty = true;
    }
    if (paused && !moving && !easing && !dirty) return;
    dirty = false;
    if (intro === null || uniforms.uDay.value > 0.5) awake = true;
    kit.wake.set(awake || intro === null ? 1 : (intro - wakeFrom) / wakeSeconds);
    uniforms.uTime.value = time;
    lighting.follow(rig.focus);
    city.update(time, camera);
    camera.updateMatrixWorld();
    // The tilt-shift keeps a band round the look point sharp, and lets go of it high over the city.
    focus.copy(rig.focus).project(camera);
    const high = MathUtils.smoothstep(camera.position.y, 30, 60);
    post.setFocus((focus.y + 1) / 2, (layout === 'wide' ? 2.6 : 1.8) * (1 - high));
    post.render(time);
    const show = intro === null ? 1 : MathUtils.smoothstep(intro, introSeconds - 1.5, introSeconds);
    tags.update(camera, show, panels?.inView() ?? []);
    css.render(scene, camera);
    const verdict = pace.check(now, dt);
    if (verdict === 'step') resize();
    if (verdict === 'slow') {
      onSlow();
      return;
    }
    if (drawn) return;
    drawn = true;
    host.classList.add('is-ready');
    netmap?.classList.add('is-3d');
  };

  const sync = () => {
    const visible = !document.hidden && root.dataset.view !== 'api' && (full || inView);
    if (visible && !frame) {
      last = 0;
      frame = requestAnimationFrame(tick);
    } else if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const watchPage = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === 'data-theme')) applyTheme();
    sync();
  });
  const watchPause = new MutationObserver(() => {
    paused = pressed();
    rig.sway.steady = paused;
    dirty = true;
  });
  const watchSize = new ResizeObserver(resize);
  const watchLayout = new ResizeObserver(measure);
  const watchView =
    full || !netmap
      ? null
      : new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? inView;
          sync();
        });

  applyTheme();
  resize();
  if (intro === null) rig.jump();
  watchPage.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-view'] });
  if (pause) watchPause.observe(pause, { attributes: true, attributeFilter: ['aria-pressed'] });
  watchSize.observe(host);
  watchLayout.observe(document.body);
  if (watchView && netmap) watchView.observe(netmap);
  document.addEventListener('visibilitychange', sync);
  sync();

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    [watchPage, watchPause, watchSize, watchLayout, watchView].forEach((watch) => watch?.disconnect());
    document.removeEventListener('visibilitychange', sync);
    interaction?.stop();
    release(scene);
    city.dispose();
    lighting.dispose();
    post.dispose();
  };

  return { stop };
}
