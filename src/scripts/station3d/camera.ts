import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import type { ToWorld } from './geometry';
import type { SceneModel, SceneStation } from './model';
import { frameBeside, panelOf } from './panels';

export type Shot = { pos: Vector3; look: Vector3 };

/** Shots by the key an element of the page names in its data-cam attribute, the opening shot and the lite shot. */
export type Shots = { intro: Shot; lite: Shot; byKey: Map<string, Shot> };

/** Seconds of the opening shot, and how long it stays level with the platform before it rises over the network. */
export const introSeconds = 6;
const introHold = 3.4;

/** Width over height the shots are framed for; a narrower frame steps back so the network still fits. */
const framedAspect = 1.6;

/** The same for the lite shot, framed for the square hero map box of a phone (Station3D.astro). */
const liteAspect = 1;

/**
 * Share of the window width the room beside a platform panel is framed for; a narrower room steps the camera back so
 * the shot still fits in it, by at most `roomBack` times.
 */
const framedRoom = 0.46;
const roomBack = 1.25;

/**
 * Lite level in the wide hero map (a touch screen from 1024px wide, a box wider than `wideBox`): the name block sits
 * over the left of the map, so the lite shot is drawn at `wideFrame` of the width.
 */
const wideBox = 1.5;
const wideFrame = 0.62;

/** Smooth step from 0 to 1, clamped. */
export function smooth(value: number): number {
  const x = MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

function centre(points: Vector3[]): Vector3 {
  return points.reduce((sum, point) => sum.add(point), new Vector3()).divideScalar(Math.max(1, points.length));
}

function shot(look: Vector3, from: Vector3): Shot {
  return { look, pos: look.clone().add(from) };
}

/** Side the camera of a line comes from: the side its station labels are written on, else away from the middle. */
function sideOf(stations: SceneStation[], x: number, middle: number): number {
  const anchor = stations[0]?.label.anchor;
  if (anchor === 'end') return -1;
  if (anchor === 'start') return 1;
  return x < middle ? -1 : 1;
}

/**
 * Shots of the scene, all from the data: 'overview' over the whole network; 'start' along the first stretch of the
 * current line; 'line-<n>' over the stations of a line; 'hubs' on the interchanges every line goes through; 'end'
 * over the platform. The opening shot stands level with the platform and looks back up the trunk; the lite shot looks
 * down on the trunk and the platform.
 */
export function buildShots(model: SceneModel, at: ToWorld): Shots {
  const byKey = new Map<string, Shot>();
  const all = model.lines.flatMap((line) => line.track.map((xy) => at(xy)));
  const xs = all.map((point) => point.x);
  const zs = all.map((point) => point.z);
  const middle = v((Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2);
  // The name block of the hero sits over the left of the frame, so the network is framed a little to the right.
  const overview = shot(middle.clone().add(v(1.2, 0, 0.2)), v(1.6, 10.5, 15.1));
  byKey.set('overview', overview);

  model.lines.forEach((line) => {
    const stations = model.stations.filter((station) => station.line === line.number);
    const points = stations.length > 0 ? stations.map((station) => at(station.xy)) : [at(line.track[0])];
    const look = centre(points).add(v(0, 0.2, 0));
    const side = sideOf(stations, look.x, middle.x);
    byKey.set(`line-${line.number}`, shot(look, v(side * 5.9, 4, 5.7)));
    if (line.number === model.current) {
      const start = centre([at(line.track[0]), points[0]]).add(v(0, 0.2, 0));
      byKey.set('start', shot(start, v(side * 5.9, 4, 5.7)));
    }
  });

  const hubs = model.interchanges.filter((item) => item.hub);
  const joins = (hubs.length > 0 ? hubs : model.interchanges).map((item) => at(item.xy));
  byKey.set('hubs', joins.length > 0 ? shot(centre(joins).add(v(0, 0.3, -0.8)), v(6.2, 3.1, 6.2)) : overview);

  const end = at(model.end.xy);
  // Raised over the roof and a step back from the platform, turned towards the trunk: the roof with its strips of
  // light, the platform, the train at it, "Now" and "You are here" all fit in the room beside the Contact panel.
  byKey.set('end', shot(end.clone().add(v(-0.35, 0.4, -2.1)), v(4.75, 3.2, 7.8)));
  const intro = { pos: end.clone().add(v(2.3, 1.25, 4.6)), look: end.clone().add(v(-0.2, 0.35, -6)) };
  // Lite level: close on the stretch where the lines join the trunk and on the platform, from high up on the side of
  // the trunk away from the station, so the platform stands behind the trains coming in and never hides them.
  const lite = shot(end.clone().add(v(0.55, 0.3, -2.45)), v(-3.7, 8.3, 5.3));
  return { intro, lite, byKey };
}

/**
 * A shot held by an element of the page: its middle on the page, where its look point is drawn in the window, and the
 * room it has there (panels.ts).
 */
type Anchor = { shot: Shot; middle: number; frame: number; room: number };

/**
 * Camera that follows the page: every element with a data-cam attribute holds a shot, and the camera flies from one
 * to the next as the middle of the window passes their middles, eased and damped. At the full level each shot is
 * framed in the room its platform panel leaves: the look point is drawn in the middle of that room rather than in the
 * middle of the window (a view offset), sliding across as the shots change, and the camera steps back when that room
 * is narrower than the shots are framed for. Without `follow` (the lite level) it holds the lite shot, in the middle
 * of the hero map box, or right of it in the wide map.
 */
export class Rig {
  private readonly camera: PerspectiveCamera;
  private readonly shots: Shots;
  private readonly follow: boolean;
  private readonly fallback: Anchor;
  private anchors: Anchor[] = [];
  private fit = 1;
  private width = 1;
  private height = 1;
  private readonly pos = new Vector3();
  private readonly look = new Vector3();
  /** Point of the window the look point is drawn at, as a share of its width from the left. */
  private frame = 0.5;
  /** Sideways shift of the view last set on the camera, in pixels; NaN until it is set. */
  private shift = Number.NaN;
  private readonly goal = { pos: new Vector3(), look: new Vector3(), frame: 0.5 };

  constructor(camera: PerspectiveCamera, shots: Shots, follow: boolean) {
    this.camera = camera;
    this.shots = shots;
    this.follow = follow;
    const held = follow ? (shots.byKey.get('overview') ?? shots.intro) : shots.lite;
    this.fallback = { shot: held, middle: 0, frame: 0.5, room: 1 };
    this.pos.copy(shots.intro.pos);
    this.look.copy(shots.intro.look);
  }

  /** Page positions, frames and rooms of the anchors; measured again whenever the page changes size. */
  measure(): void {
    if (!this.follow) return;
    // The window stops at the end of the page: a block too near it holds its shot from as far as the window goes.
    const lowest = document.documentElement.scrollHeight - innerHeight / 2;
    this.anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-cam]')).flatMap((element): Anchor[] => {
      const shot = this.shots.byKey.get(element.dataset.cam ?? '');
      const box = element.getBoundingClientRect();
      if (!shot || box.height === 0) return [];
      const middle = Math.min(box.top + scrollY + box.height / 2, lowest);
      return [{ shot, middle, ...frameBeside(panelOf(element), this.width) }];
    });
  }

  /** Size of the canvas: sets the aspect and the view offset of the camera again. */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.fit = Math.max(1, (this.follow ? framedAspect : liteAspect) / (width / height));
    if (!this.follow) this.fallback.frame = width / height > wideBox ? wideFrame : 0.5;
    this.camera.aspect = width / height;
    this.shift = Number.NaN;
    this.project();
  }

  /** Puts the camera on its goal at once (no opening shot). */
  jump(): void {
    const goal = this.target();
    this.pos.copy(goal.pos);
    this.look.copy(goal.look);
    this.frame = goal.frame;
    this.aim();
  }

  /** Moves the camera; `intro` is the time into the opening shot, null once it is over. True while it still moves. */
  update(dt: number, intro: number | null): boolean {
    const goal = this.target();
    if (intro !== null) {
      const k = smooth((intro - introHold) / (introSeconds - introHold));
      this.pos.lerpVectors(this.shots.intro.pos, goal.pos, k);
      this.look.lerpVectors(this.shots.intro.look, goal.look, k);
      this.frame = MathUtils.lerp(0.5, goal.frame, k);
    } else {
      const k = 1 - Math.pow(0.0015, dt);
      this.pos.lerp(goal.pos, k);
      this.look.lerp(goal.look, k);
      this.frame = MathUtils.lerp(this.frame, goal.frame, k);
    }
    this.aim();
    const still =
      this.pos.distanceToSquared(goal.pos) < 1e-6 &&
      this.look.distanceToSquared(goal.look) < 1e-6 &&
      Math.abs(this.frame - goal.frame) < 1e-4;
    return intro !== null || !still;
  }

  private aim(): void {
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
    this.project();
  }

  /**
   * Draws the look point at `frame` of the window width: the view of a window of the same size shifted sideways, or
   * no offset at all in the middle. Set again only when the shift changes by half a pixel or the size changes.
   */
  private project(): void {
    const shift = Math.round((0.5 - this.frame) * this.width * 2) / 2;
    if (shift === this.shift) return;
    this.shift = shift;
    if (shift === 0) this.camera.clearViewOffset();
    else this.camera.setViewOffset(this.width, this.height, shift, 0, this.width, this.height);
  }

  private target(): { pos: Vector3; look: Vector3; frame: number } {
    const anchors = this.anchors;
    let from = anchors[0] ?? this.fallback;
    let to = from;
    let t = 0;
    const middle = scrollY + innerHeight / 2;
    for (let index = 0; index < anchors.length - 1; index += 1) {
      const [a, b] = [anchors[index], anchors[index + 1]];
      if (middle < b.middle) {
        [from, to] = [a, b];
        t = smooth((middle - a.middle) / Math.max(1, b.middle - a.middle));
        break;
      }
      from = to = b;
    }
    this.goal.pos.lerpVectors(from.shot.pos, to.shot.pos, t);
    this.goal.look.lerpVectors(from.shot.look, to.shot.look, t);
    this.goal.frame = MathUtils.lerp(from.frame, to.frame, t);
    // Steps back for a frame narrower than the shots are framed for, and for a narrow room beside a panel.
    const room = MathUtils.lerp(from.room, to.room, t);
    const back = this.fit * MathUtils.clamp(framedRoom / room, 1, roomBack);
    if (back > 1) this.goal.pos.sub(this.goal.look).multiplyScalar(back).add(this.goal.look);
    return this.goal;
  }
}
