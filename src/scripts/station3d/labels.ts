import { MathUtils, Vector3, type Camera } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Layout } from './level';
import type { SceneModel } from './model';
import type { Box } from './panels';
import { RankedLabels, type Placeable } from './placement';
import type { Anchor, Anchors } from './station';

/** A label; `major` ones show at any distance, `shown` is the opacity last written (-1 before the first frame). */
type Tag = Placeable & { major: boolean; shown: number };

export type Tags = {
  objects: CSS2DObject[];
  /** Size of the layer of the labels, in CSS pixels. */
  setSize: (width: number, height: number) => void;
  /**
   * Fades the labels: `show` for all of them (0 during most of the opening shot), the others than "Now" and "You are
   * here" also by distance at the full level, and on a wide window every one that comes up to one of `panels` (window
   * boxes of the platform panels on screen). On a narrow window and at the lite level only the labels set out by
   * placement.ts show.
   */
  update: (camera: Camera, show: number, panels: Box[]) => void;
};

/** Labels other than "Now" and "You are here" fade out between these distances from the camera. */
const near = 26;
const far = 46;

/** A label fades out over this many pixels as it comes up to a panel, and is gone once it touches it. */
const panelFade = 24;

function text(className: string, content: string): HTMLElement {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = content;
  return element;
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

/**
 * Labels of the scene as glass chips pinned to it, from the data in the language of the page: the stations of the
 * projects edged in their line colour, the interchanges, "Now" and "You are here". The companies are written by the
 * holograms over the line starts (magic.ts). Interchange labels are buttons that turn the technology filter of the
 * Experience block on and off (SkillFilter.astro listens to the "skillfilter" event); every other label is hidden from
 * screen readers, which read the SVG map instead. On a wide window a label never shows over a platform panel: it
 * fades out as it comes up to one. On a narrow window only the main labels are made ("Now", "You are here", the hubs,
 * the stations), and at the lite level only "Now" and the hubs; both show them in this order of rank, each only where
 * it fits on the canvas clear of those before it (placement.ts).
 */
export function buildTags(model: SceneModel, anchors: Anchors, layout: Layout): Tags {
  const lite = layout === 'lite';
  const tags: Tag[] = [];
  const add = (element: HTMLElement, { position, centre }: Anchor, major: boolean): Tag => {
    if (!(element instanceof HTMLButtonElement)) element.setAttribute('aria-hidden', 'true');
    const object = new CSS2DObject(element);
    object.position.copy(position);
    object.center.set(centre[0], centre[1]);
    const tag: Tag = { object, element, home: position.clone(), centre, width: 0, height: 0, major, shown: -1 };
    tags.push(tag);
    return tag;
  };

  const stations: Tag[] = [];
  if (!lite) {
    model.stations.forEach((station, index) => {
      const token = model.lines.find((line) => line.number === station.line)?.token;
      const element = text('s3d-tag s3d-station', station.name);
      if (token) element.style.setProperty('--tag', `var(${token})`);
      stations.push(add(element, anchors.stations[index], false));
    });
  }

  const hubs: Tag[] = [];
  model.interchanges.forEach((item, index) => {
    if (layout !== 'wide' && !item.hub) return;
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
    const tag = add(button, anchors.interchanges[index], false);
    if (item.hub) hubs.push(tag);
  });

  const now = add(text('s3d-tag s3d-now', model.text.now), anchors.now, true);
  const here = lite ? [] : [add(text('s3d-tag s3d-here', model.text.here), anchors.here, true)];
  const placer = layout === 'wide' ? null : new RankedLabels([now, ...here, ...hubs, ...stations]);

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
    return MathUtils.smoothstep(clearance(box, panels), 0, panelFade);
  };

  /** 1 near the camera, down to 0 far from it; always 1 for "Now" and "You are here". */
  const nearness = (tag: Tag, camera: Camera) =>
    tag.major ? 1 : 1 - MathUtils.smoothstep(camera.position.distanceTo(tag.object.position), near, far);

  /** Opacity of a label on a wide window. */
  const wideOpacity = (tag: Tag, camera: Camera, show: number, panels: Box[]) => {
    const base = show * nearness(tag, camera);
    return base > 0 ? base * besidePanels(tag, camera, panels) : 0;
  };

  const setSize = (layerWidth: number, layerHeight: number) => {
    width = layerWidth;
    height = layerHeight;
    tags.forEach((tag) => {
      tag.width = 0;
      tag.height = 0;
    });
    placer?.setSize(layerWidth, layerHeight);
  };

  const update = (camera: Camera, show: number, panels: Box[]) => {
    // The ranked labels are only set out while they can show; on a narrow window only those near enough take part.
    const keep = layout === 'narrow' ? (tag: Tag) => nearness(tag, camera) > 0 : undefined;
    const placed = placer && show > 0 ? placer.place(camera, keep) : null;
    tags.forEach((tag) => {
      let value = 0;
      if (!placer) value = wideOpacity(tag, camera, show, panels);
      else if (placed?.has(tag)) value = lite ? show : show * nearness(tag, camera);
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
