import { Matrix4, Vector3, type Camera } from 'three';
import type { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Box } from './panels';

/** A label of the scene; `width` and `height` are its size in pixels, 0 until it is measured on the page. */
export type Placeable = {
  object: CSS2DObject;
  element: HTMLElement;
  /** Its point in the scene, and which point of the label sits there. */
  home: Vector3;
  centre: [number, number];
  width: number;
  height: number;
};

/** Pixels a label keeps from the edge of the canvas, and from another label. */
const margin = 4;
const gap = 2;

/** True when two boxes come closer than `gap` pixels. */
function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;
}

/**
 * Labels set out in order of rank (the lite level, and the narrow layout of the full level): a label shows only when
 * its chip fits inside the canvas and stays clear of the chip of every label ranked before it. The labels are set out
 * again only when the camera or the size of the canvas changes.
 */
export class RankedLabels<T extends Placeable> {
  private readonly items: T[];
  private readonly shown = new Set<T>();
  private readonly view = new Matrix4();
  private readonly projection = new Matrix4();
  private readonly point = new Vector3();
  private width = 1;
  private height = 1;
  private fresh = false;

  /** `items` in order of rank: the first is set out first. */
  constructor(items: T[]) {
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

  /**
   * Labels that show with the camera as it is now. `keep`, when given, says which labels take part at all; it must
   * only depend on the camera.
   */
  place(camera: Camera, keep?: (item: T) => boolean): ReadonlySet<T> {
    const same = this.view.equals(camera.matrixWorld) && this.projection.equals(camera.projectionMatrix);
    if (this.fresh && same) return this.shown;
    this.view.copy(camera.matrixWorld);
    this.projection.copy(camera.projectionMatrix);
    this.shown.clear();
    const taken: Box[] = [];
    // A label that is not on the page yet has no size: the labels are set out again on the next frame.
    let sized = true;
    this.items.forEach((item) => {
      if (keep && !keep(item)) return;
      if (!this.measure(item)) {
        sized = false;
        return;
      }
      const box = this.boxOf(item, camera);
      if (!box || !this.inside(box) || taken.some((other) => overlaps(box, other))) return;
      taken.push(box);
      this.shown.add(item);
    });
    this.fresh = sized;
    return this.shown;
  }

  private measure(item: T): boolean {
    if (item.width === 0) {
      item.width = item.element.offsetWidth;
      item.height = item.element.offsetHeight;
    }
    return item.width > 0;
  }

  /** Box of `item` as CSS2DRenderer draws it; null when its point is out of the view. */
  private boxOf(item: T, camera: Camera): Box | null {
    const { x, y, z } = this.point.copy(item.home).project(camera);
    if (z < -1 || z > 1) return null;
    const left = ((x + 1) / 2) * this.width - item.centre[0] * item.width;
    const top = ((1 - y) / 2) * this.height - item.centre[1] * item.height;
    return { left, top, right: left + item.width, bottom: top + item.height };
  }

  private inside(box: Box): boolean {
    const { width, height } = this;
    return box.left >= margin && box.top >= margin && box.right <= width - margin && box.bottom <= height - margin;
  }
}
