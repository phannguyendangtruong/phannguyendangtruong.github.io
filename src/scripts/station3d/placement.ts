import { Matrix4, Vector3, type Camera } from 'three';
import type { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Box } from './panels';

/** A label of the scene; `width` and `height` are its size in pixels, 0 until it is measured on the page. */
export type Placeable = {
  object: CSS2DObject;
  element: HTMLElement;
  /** Its point on the desktop map, and which point of the label sits there. */
  home: Vector3;
  centre: [number, number];
  /** Line start at the lite level: points along its track from the start, tried when the start is out of the frame. */
  track: Vector3[] | null;
  width: number;
  height: number;
};

/** Pixels a label keeps from the edge of the canvas, and from another label. */
const margin = 4;
const gap = 2;

/**
 * Share of the half-size of the canvas within which a point counts as in the frame: the lite canvas fades out towards
 * its edge (the mask in Station3D.astro), so a track only shows clearly inside it.
 */
const inner = 0.8;

/** Points of a line start label tried on its point in turn: the label on the right of it, the left, above, below. */
const sides: [number, number][] = [
  [0, 0.5],
  [1, 0.5],
  [0.5, 1],
  [0.5, 0],
];

/** True when two boxes come closer than `gap` pixels. */
function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;
}

/**
 * Labels of the lite level, set out in order of rank: a label shows only when it fits inside the canvas and its text
 * stays clear of the text of every label ranked before it. A line start out of the frame moves to where its track
 * comes into the frame, on whichever side of that point it fits. The labels are set out again only when the camera or
 * the size of the canvas changes.
 */
export class LiteLabels {
  private readonly items: Placeable[];
  private readonly shown = new Set<Placeable>();
  /** Padding of each label around its text (the box of a filter button), in pixels across and down. */
  private readonly pads = new Map<Placeable, [number, number]>();
  private readonly view = new Matrix4();
  private readonly projection = new Matrix4();
  private readonly point = new Vector3();
  private width = 1;
  private height = 1;
  private fresh = false;

  /** `items` in order of rank: the first is set out first. */
  constructor(items: Placeable[]) {
    this.items = items;
  }

  /** Size of the canvas, in CSS pixels; the labels are measured again. */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.items.forEach((item) => {
      item.width = 0;
      item.height = 0;
    });
    this.fresh = false;
  }

  /** Labels that show with the camera as it is now. */
  place(camera: Camera): ReadonlySet<Placeable> {
    const same = this.view.equals(camera.matrixWorld) && this.projection.equals(camera.projectionMatrix);
    if (this.fresh && same) return this.shown;
    this.view.copy(camera.matrixWorld);
    this.projection.copy(camera.projectionMatrix);
    this.shown.clear();
    const taken: Box[] = [];
    // A label that is not on the page yet has no size: the labels are set out again on the next frame.
    let sized = true;
    this.items.forEach((item) => {
      if (!this.measure(item)) {
        sized = false;
        return;
      }
      const text = this.fit(item, camera, taken);
      if (!text) return;
      taken.push(text);
      this.shown.add(item);
    });
    this.fresh = sized;
    return this.shown;
  }

  private measure(item: Placeable): boolean {
    if (item.width === 0) {
      item.width = item.element.offsetWidth;
      item.height = item.element.offsetHeight;
      const style = getComputedStyle(item.element);
      this.pads.set(item, [parseFloat(style.paddingLeft) || 0, parseFloat(style.paddingTop) || 0]);
    }
    return item.width > 0;
  }

  /** Sets out `item` and gives the box of its text, or null when it fits nowhere. */
  private fit(item: Placeable, camera: Camera, taken: Box[]): Box | null {
    const anchor = item.track ? this.entry(item, camera) : item.home;
    if (!anchor) return null;
    const [padX, padY] = this.pads.get(item) ?? [0, 0];
    for (const side of item.track ? sides : [item.centre]) {
      const box = this.boxAt(anchor, side, item, camera);
      if (!box || !this.inside(box)) continue;
      const text = { left: box.left + padX, top: box.top + padY, right: box.right - padX, bottom: box.bottom - padY };
      if (taken.some((other) => overlaps(text, other))) continue;
      item.object.position.copy(anchor);
      item.object.center.set(side[0], side[1]);
      return text;
    }
    return null;
  }

  /** The point of a line start when it is in the frame, else the first point of its track that is; null if none is. */
  private entry(item: Placeable, camera: Camera): Vector3 | null {
    if (this.inFrame(item.home, camera)) return item.home;
    return item.track?.find((point) => this.inFrame(point, camera)) ?? null;
  }

  private inFrame(position: Vector3, camera: Camera): boolean {
    const { x, y, z } = this.point.copy(position).project(camera);
    return z > -1 && z < 1 && x * x + y * y < inner * inner;
  }

  /** Box of `item` with its point `side` on `position`, as CSS2DRenderer draws it; null when out of the view. */
  private boxAt(position: Vector3, side: [number, number], item: Placeable, camera: Camera): Box | null {
    const { x, y, z } = this.point.copy(position).project(camera);
    if (z < -1 || z > 1) return null;
    const left = ((x + 1) / 2) * this.width - side[0] * item.width;
    const top = ((1 - y) / 2) * this.height - side[1] * item.height;
    return { left, top, right: left + item.width, bottom: top + item.height };
  }

  private inside(box: Box): boolean {
    const { width, height } = this;
    return box.left >= margin && box.top >= margin && box.right <= width - margin && box.bottom <= height - margin;
  }
}
