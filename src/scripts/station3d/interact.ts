import {
  BoxGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  type Object3D,
  type Vector3,
  type PerspectiveCamera,
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Rig } from './camera';
import type { City } from './city';
import type { Layout } from './level';
import type { SceneModel } from './model';
import { stationLift } from './station';

/** What the pointer is on: the line it lights, the text of the card, and where the card hangs (null: over a hologram). */
type Pick = { line: number; title: string; sub: string; at: Vector3 | null; mesh: Mesh };

/** Light of the line the pointer is on, and of the others meanwhile; share of the way left after one second. */
const brighter = 2.4;
const dimmer = 0.25;
const easing = 0.002;

/** A press that moves further than this, in pixels, is a drag or a scroll, not a click or a tap. */
const slop = 8;

/**
 * What stands between the pointer and the scene, and so keeps it from the scene: links, buttons and fields, the
 * header and the footer, the name block of the hero, and the surfaces of the blocks (the platform panels of a wide
 * window, the cards of a narrow one, Station3D.astro and Station3DNarrow.astro).
 */
const solid = 'a, button, input, select, textarea, label, summary, dialog, [role="dialog"], header, footer, .hero-text';
const surfaces: Record<Exclude<Layout, 'lite'>, string> = {
  wide: 'main > section.section > .container',
  narrow: [
    'main > section.section:not(#experience) > .container',
    '#experience .section-head',
    '#experience .leg',
    '#experience .origin',
  ].join(', '),
};

export type InteractionOptions = {
  layout: Exclude<Layout, 'lite'>;
  model: SceneModel;
  city: City;
  camera: PerspectiveCamera;
  rig: Rig;
  /** Layer of the canvas: the pointer is read against its box. */
  host: HTMLElement;
  /** Called when the scene must be drawn again although nothing moves (the card shows or hides). */
  onChange: () => void;
};

export type Interaction = {
  /** Glass card of what the pointer is on, a label of the scene. */
  card: CSS2DObject;
  /** Eases the light of the lines towards the pick; true while it still changes. */
  update: (dt: number) => boolean;
  stop: () => void;
};

/**
 * Pointing at the scene, at the full level, only where it lies open (never through a block, a link, a button or a
 * label): over a project station or a company hologram its line lights up and the others dim, and a glass card names
 * it (the station and its company and line, or the company and its line and start year) with a hint to go there. A
 * click, or on a touch screen a second tap on the same thing, scrolls the page to the block of that line, which holds
 * its shot (camera.ts), so the camera flies there. The mouse also leans the drone a little (sway.ts). The card is
 * hidden from screen readers, which have the same in the Experience block.
 */
export function buildInteraction(options: InteractionOptions): Interaction {
  const { layout, model, city, camera, rig, host, onChange } = options;
  const root = document.documentElement;
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const shape = new BoxGeometry(2.8, 1.6, 2.8);
  const unseen = new MeshBasicMaterial({ visible: false });
  // Boxes round the stations to pick, never drawn and kept out of the scene.
  const boxes = new Group();
  const picks = new Map<Object3D, Pick>();
  const lineOf = new Map(model.lines.map((line) => [line.number, line] as const));

  model.stations.forEach((station, index) => {
    const line = lineOf.get(station.line);
    const anchor = city.anchors.stations[index];
    if (!line || !anchor) return;
    const mesh = new Mesh(shape, unseen);
    mesh.position.copy(anchor.position).setY(anchor.position.y - stationLift + 0.5);
    boxes.add(mesh);
    const at = anchor.position.clone().setY(anchor.position.y + 0.35);
    picks.set(mesh, { line: line.number, title: station.name, sub: `${line.company} · ${line.name}`, at, mesh });
  });
  boxes.updateMatrixWorld(true);
  city.holos.forEach(({ line: number, mesh }) => {
    const line = lineOf.get(number);
    if (line) picks.set(mesh, { line: number, title: line.company, sub: line.since, at: null, mesh });
  });
  const targets = Array.from(picks.keys());

  const element = document.createElement('div');
  element.className = 's3d-card';
  element.setAttribute('aria-hidden', 'true');
  const title = document.createElement('b');
  const sub = document.createElement('small');
  const hint = document.createElement('span');
  hint.textContent = model.text.go;
  element.append(title, sub, hint);
  const card = new CSS2DObject(element);
  card.center.set(0.5, 1);
  card.visible = false;

  const emphasis = new Map(model.lines.map((line) => [line.number, 1]));
  let picked: Pick | null = null;
  let tapped: Pick | null = null;
  let down: { x: number; y: number } | null = null;

  /** The page is in a state where the scene takes no pointer: the JSON view, the menu or the command palette. */
  const busy = () =>
    root.dataset.view === 'api' || root.classList.contains('menu-lock') || root.classList.contains('cmdk-lock');
  const open = (target: EventTarget | null) =>
    !busy() && target instanceof Element && !target.closest(`${solid}, ${surfaces[layout]}`);

  const pick = (event: PointerEvent): Pick | null => {
    const box = host.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(targets, false)[0];
    return hit ? (picks.get(hit.object) ?? null) : null;
  };

  const show = (next: Pick | null) => {
    if (next === picked) return;
    picked = next;
    document.body.style.cursor = next ? 'pointer' : '';
    card.visible = next !== null;
    onChange();
    if (!next) return;
    const token = lineOf.get(next.line)?.token;
    if (token) element.style.setProperty('--tag', `var(${token})`);
    title.textContent = next.title;
    sub.textContent = next.sub;
    card.position.copy(next.at ?? next.mesh.position.clone().setY(next.mesh.position.y + 1.1));
  };

  const go = (target: Pick) => {
    const middle = rig.middleOf(`line-${target.line}`);
    if (middle !== null) scrollTo({ top: Math.max(0, middle - innerHeight / 2), behavior: 'smooth' });
    show(null);
    tapped = null;
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    rig.sway.pointer.set((event.clientX / innerWidth) * 2 - 1, (event.clientY / innerHeight) * 2 - 1);
    show(open(event.target) ? pick(event) : null);
  };
  const press = (event: PointerEvent) => {
    down = { x: event.clientX, y: event.clientY };
  };
  const release = (event: PointerEvent) => {
    const start = down;
    down = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > slop) return;
    if (event.button !== 0 || !open(event.target)) return;
    const target = pick(event);
    if (!target) {
      show(null);
      tapped = null;
      return;
    }
    // A mouse goes at once; a finger first shows the card, then goes on a second tap of the same thing.
    if (event.pointerType !== 'touch' || tapped?.mesh === target.mesh) {
      go(target);
      return;
    }
    tapped = target;
    show(target);
  };
  // The pointer has left the window: no pick, the drone back level.
  const leave = (event: PointerEvent) => {
    if (event.relatedTarget !== null) return;
    rig.sway.pointer.set(0, 0);
    show(null);
  };

  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerdown', press, { passive: true });
  addEventListener('pointerup', release);
  document.addEventListener('pointerout', leave);
  rig.sway.leans = true;

  const update = (dt: number): boolean => {
    const k = 1 - Math.pow(easing, dt);
    let changing = false;
    emphasis.forEach((value, number) => {
      const goal = picked ? (picked.line === number ? brighter : dimmer) : 1;
      if (value === goal) return;
      const next = Math.abs(goal - value) < 1e-3 ? goal : MathUtils.lerp(value, goal, k);
      emphasis.set(number, next);
      city.emphasize(number, next);
      changing = true;
    });
    return changing;
  };

  const stop = () => {
    removeEventListener('pointermove', move);
    removeEventListener('pointerdown', press);
    removeEventListener('pointerup', release);
    document.removeEventListener('pointerout', leave);
    document.body.style.cursor = '';
    rig.sway.leans = false;
    shape.dispose();
    unseen.dispose();
  };

  return { card, update, stop };
}
