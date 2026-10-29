import { Vector3, type Camera } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { smooth } from './camera';
import { trackY, type ToWorld } from './geometry';
import type { SceneLabel, SceneModel } from './model';
import type { Box } from './panels';
import { LiteLabels, type Placeable } from './placement';

/** A label; `major` ones show at any distance, `shown` is the opacity last written (-1 before the first frame). */
type Tag = Placeable & { major: boolean; shown: number };

export type Tags = {
  objects: CSS2DObject[];
  /** Size of the layer of the labels, in CSS pixels. */
  setSize: (width: number, height: number) => void;
  /**
   * Fades the labels: `show` for all of them (0 during the opening shot), minor ones also by distance, and every one
   * that comes up to one of `panels` (window boxes of the platform panels on screen, none at the lite level). At the
   * lite level only the labels set out by placement.ts show.
   */
  update: (camera: Camera, show: number, panels: Box[]) => void;
};

/** Minor labels (stations, interchanges that are not hubs) show within this distance and fade out over the next 3. */
const near = 8;
const fadeOver = 3;

/** A label fades out over this many pixels as it comes up to a panel, and is gone once it touches it. */
const panelFade = 24;

function text(tag: 'div' | 'span', className: string, content: string): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}

/** Point of the element that sits on the label point, from the anchor of the map label. */
function centreOf(anchor: SceneLabel['anchor']): [number, number] {
  if (anchor === 'start') return [0, 0.5];
  if (anchor === 'end') return [1, 0.5];
  return [0.5, 0];
}

/** True while the filter is on for `key` (a control of the page shows it pressed). */
function pressed(key: string): boolean {
  return document.querySelector(`[data-skill="${CSS.escape(key)}"][aria-pressed="true"]`) !== null;
}

/** Pixels between `box` and the nearest of `panels`: 0 or less when it touches or overlaps one. */
function clearance(box: Box, panels: Box[]): number {
  let least = Infinity;
  panels.forEach((panel) => {
    const apart = [panel.left - box.right, box.left - panel.right, panel.top - box.bottom, box.top - panel.bottom];
    least = Math.min(least, Math.max(...apart));
  });
  return least;
}

/** Points every `step` scene units along a track, from its start. */
function pointsAlong(points: Vector3[], step = 0.1): Vector3[] {
  const result = [points[0].clone()];
  points.slice(1).forEach((point, index) => {
    const from = points[index];
    const count = Math.max(1, Math.ceil(from.distanceTo(point) / step));
    for (let k = 1; k <= count; k += 1) result.push(from.clone().lerp(point, k / count));
  });
  return result;
}

/**
 * Labels of the scene, from the data in the language of the page: company and start year with the route bullet at
 * each line start, the short station names, the interchanges, the end and "You are here". Interchange labels are
 * buttons that turn the technology filter of the Experience block on and off (SkillFilter.astro listens to the
 * "skillfilter" event); every other label is hidden from screen readers, which read the SVG map instead. At the full
 * level a label never shows over a platform panel: it fades out as it comes up to one, so none is cut at the edge of
 * a panel. At the lite level only "Now", the hubs and the line starts show, in this order of rank, the current line
 * first, each only where it fits on the canvas clear of those before it (placement.ts).
 */
export function buildTags(model: SceneModel, at: ToWorld, here: Vector3, lite: boolean): Tags {
  const tags: Tag[] = [];
  const add = (element: HTMLElement, position: Vector3, centre: [number, number], major: boolean): Tag => {
    if (!(element instanceof HTMLButtonElement)) element.setAttribute('aria-hidden', 'true');
    const object = new CSS2DObject(element);
    object.position.copy(position);
    object.center.set(centre[0], centre[1]);
    const tag: Tag = {
      object,
      element,
      home: position.clone(),
      centre,
      track: null,
      width: 0,
      height: 0,
      major,
      shown: -1,
    };
    tags.push(tag);
    return tag;
  };
  // Map labels are set on their baseline: the middle of the text sits a little higher, its top higher still.
  const spot = (label: SceneLabel) => at([label.at[0], label.at[1] - (label.anchor === 'middle' ? 10 : 4)], trackY);

  const starts = new Map<number, Tag>();
  model.lines.forEach((line) => {
    const element = text('div', 's3d-tag s3d-start', '');
    element.style.setProperty('--line', `var(${line.token})`);
    element.style.setProperty('--on-line', `var(${line.onToken})`);
    element.append(
      text('span', 's3d-bullet', String(line.number)),
      text('span', 's3d-company', line.company),
      text('span', 's3d-year', line.year),
    );
    const tag = add(element, at([line.bullet[0] - 10, line.bullet[1]], trackY), [0, 0.5], true);
    // At the lite level the label moves to where the track comes into the frame when the start is out of it.
    if (lite) tag.track = pointsAlong(line.track.map((xy) => at(xy, trackY)));
    starts.set(line.number, tag);
  });

  model.stations.forEach((station) => {
    add(text('div', 's3d-tag', station.name), spot(station.label), centreOf(station.label.anchor), false);
  });

  const hubs: Tag[] = [];
  model.interchanges.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = item.hub ? 's3d-tag s3d-link s3d-hub' : 's3d-tag s3d-link';
    button.textContent = item.text;
    button.dataset.skill = item.key;
    button.dataset.skillName = item.name;
    button.setAttribute('aria-label', item.aria);
    button.setAttribute('aria-pressed', String(pressed(item.key)));
    button.addEventListener('click', () => {
      button.dispatchEvent(new CustomEvent('skillfilter', { bubbles: true }));
    });
    const tag = add(button, spot(item.label), centreOf(item.label.anchor), item.hub);
    if (item.hub) hubs.push(tag);
  });

  const nowText = text('div', 's3d-tag s3d-now', model.text.now);
  const now = add(nowText, spot(model.end.label), centreOf(model.end.label.anchor), true);
  add(text('div', 's3d-tag s3d-here', model.text.here), here, [0.5, 0], true);

  const order = [model.current, ...model.lines.map((line) => line.number).filter((n) => n !== model.current)];
  const rankedStarts = order.flatMap((number) => {
    const tag = starts.get(number);
    return tag ? [tag] : [];
  });
  const placer = lite ? new LiteLabels([now, ...hubs, ...rankedStarts]) : null;

  let width = 1;
  let height = 1;
  const point = new Vector3();
  const box: Box = { left: 0, top: 0, right: 0, bottom: 0 };

  /** 1 while the label is clear of the panels, down to 0 as it comes up to one (its box as CSS2DRenderer places it). */
  const besidePanels = (tag: Tag, camera: Camera, panels: Box[]) => {
    if (panels.length === 0) return 1;
    point.copy(tag.object.position).project(camera);
    // Out of the view: the renderer does not show it anyway.
    if (point.z < -1 || point.z > 1) return 1;
    if (tag.width === 0) {
      tag.width = tag.element.offsetWidth;
      tag.height = tag.element.offsetHeight;
    }
    box.left = ((point.x + 1) / 2) * width - tag.object.center.x * tag.width;
    box.top = ((1 - point.y) / 2) * height - tag.object.center.y * tag.height;
    box.right = box.left + tag.width;
    box.bottom = box.top + tag.height;
    return smooth(clearance(box, panels) / panelFade);
  };

  /** Opacity of a label at the full level. */
  const fullOpacity = (tag: Tag, camera: Camera, show: number, panels: Box[]) => {
    const distance = camera.position.distanceTo(tag.object.position);
    const base = show * (tag.major ? 1 : smooth((near + fadeOver - distance) / fadeOver));
    return base > 0 ? base * besidePanels(tag, camera, panels) : 0;
  };

  const setSize = (layerWidth: number, layerHeight: number) => {
    width = layerWidth;
    height = layerHeight;
    placer?.setSize(layerWidth, layerHeight);
  };

  const update = (camera: Camera, show: number, panels: Box[]) => {
    // The lite labels are only set out while they can show.
    const placed = placer && show > 0 ? placer.place(camera) : null;
    tags.forEach((tag) => {
      const value = placer ? (placed?.has(tag) ? show : 0) : fullOpacity(tag, camera, show, panels);
      // Steps of 5%, so the styles are only written when the label visibly changes.
      const shown = Math.round(value * 20) / 20;
      if (shown === tag.shown) return;
      tag.shown = shown;
      tag.element.style.opacity = String(shown);
      // A label that cannot be seen cannot be clicked or reached with Tab either.
      tag.element.style.visibility = shown === 0 ? 'hidden' : '';
    });
  };

  return { objects: tags.map((tag) => tag.object), setSize, update };
}
