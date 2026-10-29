import {
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  Sprite,
  Vector2,
  WebGLRenderer,
} from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Rig, buildShots, introSeconds, smooth } from './camera';
import { buildNetwork, mapToWorld } from './geometry';
import { buildTags } from './labels';
import type { SceneModel } from './model';
import { Panels } from './panels';
import { buildStation } from './station';
import { GroundTexture, glowTexture } from './textures';
import { Palette, lamp, readTheme } from './tokens';
import { buildTrains } from './trains';

export type StageOptions = {
  level: 'full' | 'lite';
  /** Layer of the canvas, and layer of the labels (Station3D.astro). */
  host: HTMLElement;
  labels: HTMLElement;
  model: SceneModel;
  /** Hero map (NetworkMap.astro) and its pause button. */
  netmap: HTMLElement | null;
  pause: HTMLElement | null;
  /** Called when the browser drops the WebGL context: the page goes back to the SVG map. */
  onLost: () => void;
};

export type Stage = { stop: () => void };

/** Side of the ground plane, in scene units; the fog hides its edge. */
const groundSize = 80;

/** Frees the GPU memory of every mesh and sprite of the scene. */
function release(scene: Scene): void {
  scene.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
    } else if (object instanceof Sprite) {
      object.material.dispose();
    }
  });
}

/**
 * Draws the 3D station into `host`: full level behind the whole home page with bloom and a camera that follows the
 * page, each shot framed beside its platform panel and no label over a panel; lite level in the hero map box at pixel
 * ratio 1 without bloom, a close shot of the trunk with only the main labels that fit. It draws only while it can be
 * seen (tab visible, page view rather than the JSON view, and at the lite level the hero map on screen), follows the
 * theme, stops its trains with the pause button of the hero map, and frees everything on stop.
 */
export function startStage({ level, host, labels, model, netmap, pause, onLost }: StageOptions): Stage {
  const full = level === 'full';
  const root = document.documentElement;
  host.dataset.level = level;
  labels.dataset.level = level;
  host.hidden = false;
  labels.hidden = false;

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: full ? 'high-performance' : 'default' });
  renderer.setPixelRatio(full ? Math.min(devicePixelRatio, 1.5) : 1);
  renderer.toneMapping = NeutralToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  host.append(renderer.domElement);
  const css = new CSS2DRenderer({ element: labels });

  const scene = new Scene();
  const background = new Color();
  const fog = new FogExp2(0x000000, 0.024);
  scene.background = background;
  scene.fog = fog;
  const sky = new HemisphereLight(lamp.sky, 0x000000, 0.35);
  const sun = new DirectionalLight(lamp.moon, 0.55);
  sun.position.set(-6, 12, 4);

  const palette = new Palette();
  const glow = glowTexture();
  const floor = new GroundTexture(groundSize);
  const ground = new Mesh(
    new PlaneGeometry(groundSize, groundSize),
    new MeshStandardMaterial({ map: floor.texture, roughness: 0.82, metalness: 0.15 }),
  );
  ground.rotation.x = -Math.PI / 2;
  const at = mapToWorld(model);
  const network = buildNetwork(model, at, palette);
  const station = buildStation(at(model.end.xy), palette, glow);
  const trains = buildTrains(model, network.paths, palette, glow);
  const tags = buildTags(model, at, station.here, !full);
  scene.add(sky, sun, ground, network.group, station.group, trains.group, ...tags.objects);

  const camera = new PerspectiveCamera(42, 1, 0.1, 200);
  const rig = new Rig(camera, buildShots(model, at), full);
  // The platform panels over the scene, at the full level only: the labels give way to them.
  const panels = full ? new Panels() : null;
  const composer = full ? new EffectComposer(renderer) : null;
  const bloom = full ? new UnrealBloomPass(new Vector2(1, 1), 0.55, 0.35, 0.8) : null;
  const output = full ? new OutputPass() : null;
  if (composer && bloom && output) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(output);
  }

  let bloomOn = false;
  let dirty = true;
  const applyTheme = () => {
    const theme = readTheme();
    palette.apply(theme);
    background.copy(theme.color('--bg'));
    fog.color.copy(background);
    sky.color.set(theme.dark ? lamp.sky : lamp.day);
    sky.groundColor.copy(background);
    sky.intensity = theme.sky;
    sun.color.set(theme.dark ? lamp.moon : lamp.day);
    sun.intensity = theme.sun;
    renderer.toneMappingExposure = theme.exposure;
    floor.paint(background, theme.color('--surface-2'), theme.color('--border-strong'));
    // Bloom belongs to the lit tracks of the dark theme, at the full level only.
    bloomOn = full && theme.dark;
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
    renderer.setSize(width, height);
    composer?.setPixelRatio(renderer.getPixelRatio());
    composer?.setSize(width, height);
    css.setSize(width, height);
    tags.setSize(width, height);
    rig.setSize(width, height);
    measure();
  };

  const pressed = () => pause?.getAttribute('aria-pressed') === 'true';
  let paused = pressed();
  let inView = true;
  let drawn = false;
  let frame = 0;
  let last = 0;
  // Time of the trains, frozen while paused; time into the opening shot, null once it is over or skipped.
  let time = 0;
  let intro: number | null = paused || scrollY > 10 ? null : 0;
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
    const moving = rig.update(dt, intro);
    if (panels && scrollY !== scrolled) {
      scrolled = scrollY;
      dirty = true;
    }
    if (paused && !moving && !dirty) return;
    dirty = false;
    trains.update(time);
    if (composer && bloomOn) composer.render(dt);
    else renderer.render(scene, camera);
    tags.update(camera, intro === null ? 1 : smooth((intro - introSeconds + 1.5) / 1.5), panels?.inView() ?? []);
    css.render(scene, camera);
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
    dirty = true;
  });
  const watchSize = new ResizeObserver(resize);
  const watchLayout = new ResizeObserver(measure);
  const watchView = full || !netmap ? null : new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1]?.isIntersecting ?? inView;
    sync();
  });
  const lost = () => onLost();

  applyTheme();
  resize();
  if (intro === null) rig.jump();
  watchPage.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-view'] });
  if (pause) watchPause.observe(pause, { attributes: true, attributeFilter: ['aria-pressed'] });
  watchSize.observe(host);
  watchLayout.observe(document.body);
  if (watchView && netmap) watchView.observe(netmap);
  document.addEventListener('visibilitychange', sync);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  sync();

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    [watchPage, watchPause, watchSize, watchLayout, watchView].forEach((watch) => watch?.disconnect());
    document.removeEventListener('visibilitychange', sync);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    host.classList.remove('is-ready');
    netmap?.classList.remove('is-3d');
    host.hidden = true;
    labels.hidden = true;
    delete host.dataset.level;
    delete labels.dataset.level;
    release(scene);
    glow.dispose();
    floor.dispose();
    bloom?.dispose();
    output?.dispose();
    composer?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    labels.replaceChildren();
    labels.removeAttribute('style');
  };

  return { stop };
}
