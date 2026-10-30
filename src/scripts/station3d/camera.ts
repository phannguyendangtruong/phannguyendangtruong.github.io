import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import type { Layout } from './level';
import { frameBeside, panelOf } from './panels';
import type { Shot, Shots } from './shots';

/** Seconds of the opening shot, coming down from above the clouds to the first shot of the page. */
export const introSeconds = 7.5;

/** Width over height the shots are framed for; a narrower frame steps back so the network still fits. */
const framedAspect = 1.6;

/** The same for the lite shot, framed for the square hero map box of a phone (Station3D.astro). */
const liteAspect = 1;

/**
 * Narrow layout: a window narrower than `uprightAspect` (width over height) takes the upright shots (shots.ts) and a
 * wider lens of `uprightFov` degrees; they are framed for a phone of 390 by 844 pixels (`tallAspect`).
 */
const uprightAspect = 0.8;
const uprightFov = 46;
const tallAspect = 0.46;

/**
 * Narrow layout: a block with an open gap above it taller than this, in pixels, holds its shot while the middle of
 * that gap is in the middle of the window; any other block while its own middle is.
 */
const openGap = 120;

/**
 * Share of the window width the room beside a platform panel is framed for; a narrower room steps the camera back so
 * the shot still fits in it, by at most `roomBack` times.
 */
const framedRoom = 0.46;
const roomBack = 1.25;

/**
 * Lite level in the wide hero map (a box wider than `wideBox`, from 1024px wide): the name block sits over the left of
 * the map, so the lite shot is drawn at `wideFrame` of the width.
 */
const wideBox = 1.5;
const wideFrame = 0.62;

/** Share of the way to its goal the camera still has to go after one second. */
const damping = 0.02;

const up = new Vector3(0, 1, 0);

/** Smooth step from 0 to 1, clamped. */
function smooth(value: number): number {
  const x = MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * A shot held by an element of the page: its middle on the page, where its look point is drawn in the window, and the
 * room it has there (panels.ts).
 */
type Anchor = { shot: Shot; middle: number; frame: number; frameY: number; room: number };

type Goal = { pos: Vector3; look: Vector3; frame: number; frameY: number };

/**
 * Drone that follows the page: every element with a data-cam attribute holds a shot, and the camera flies from one to
 * the next as the middle of the window passes their anchors, eased and damped, climbing a little between two shots so
 * it passes over the towers, and drifting round its point as a drone hovers. On a wide window each shot is framed in
 * the room its platform panel leaves: the look point is drawn in the middle of that room rather than in the middle of
 * the window (a view offset), sliding across as the shots change, and the camera steps back when that room is
 * narrower than the shots are framed for. On a narrow window held upright it takes the upright shots and a wider
 * lens, the look point drawn as high in the window as each shot says (a view offset too), and a block after an
 * open gap holds its shot while that gap is in the middle of the window. At the lite level it holds the lite shot
 * and swings slowly to and fro round its look point, in the middle of the hero map box, or right of it in the wide
 * map.
 */
export class Rig {
  private readonly camera: PerspectiveCamera;
  private readonly wideShots: Shots;
  private readonly tallShots: Shots | null;
  private readonly layout: Layout;
  /** Field of view of the wide shots, as the camera came. */
  private readonly lens: number;
  private shots: Shots;
  private fallback: Anchor;
  private anchors: Anchor[] = [];
  private fit = 1;
  private width = 1;
  private height = 1;
  private readonly pos = new Vector3();
  private readonly look = new Vector3();
  private readonly drift = new Vector3();
  /** Point of the window the look point is drawn at: shares of its width from the left, of its height from the top. */
  private frame = 0.5;
  private frameY = 0.5;
  /** Shift of the view last set on the camera, across and down, in pixels; NaN until it is set. */
  private shift = Number.NaN;
  private lift = Number.NaN;
  private readonly goal: Goal = { pos: new Vector3(), look: new Vector3(), frame: 0.5, frameY: 0.5 };

  /** `tall`: the upright shots, taken by a narrow window held upright (null when the layout has none). */
  constructor(camera: PerspectiveCamera, wide: Shots, tall: Shots | null, layout: Layout) {
    this.camera = camera;
    this.wideShots = wide;
    this.tallShots = tall;
    this.layout = layout;
    this.lens = camera.fov;
    this.shots = wide;
    this.fallback = this.held(wide);
    this.pos.copy(wide.intro.pos);
    this.look.copy(wide.intro.look);
  }

  /** The point the camera looks at now: the focus of the tilt-shift and the middle of the sun's shadows. */
  get focus(): Vector3 {
    return this.look;
  }

  private get follow(): boolean {
    return this.layout !== 'lite';
  }

  /** Shot held when no element of the page holds one: the overview, or the lite shot at the lite level. */
  private held(shots: Shots): Anchor {
    const shot = this.follow ? (shots.byKey.get('overview') ?? shots.intro) : shots.lite;
    return { shot, middle: 0, frame: shot.frame, frameY: shot.frameY, room: 1 };
  }

  /** Page positions, frames and rooms of the anchors; measured again whenever the page changes size. */
  measure(): void {
    if (!this.follow) return;
    const wide = this.layout === 'wide';
    // The window stops at the end of the page: a block too near it holds its shot from as far as the window goes.
    const lowest = document.documentElement.scrollHeight - innerHeight / 2;
    this.anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-cam]')).flatMap((element): Anchor[] => {
      const shot = this.shots.byKey.get(element.dataset.cam ?? '');
      const box = element.getBoundingClientRect();
      if (!shot || box.height === 0) return [];
      const top = box.top + scrollY;
      const gap = wide ? 0 : parseFloat(getComputedStyle(element).marginTop) || 0;
      const middle = Math.min(gap > openGap ? top - gap / 2 : top + box.height / 2, lowest);
      const panel = wide ? panelOf(element) : null;
      const framing = panel ? frameBeside(panel, this.width) : { frame: shot.frame, room: 1 };
      return [{ shot, middle, frameY: shot.frameY, ...framing }];
    });
  }

  /**
   * Size of the canvas: takes the upright or the wide shots and their lens, and sets the aspect and the view offset
   * of the camera again. The anchors are measured again after it.
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    const upright = this.tallShots !== null && width / height < uprightAspect;
    const shots = upright && this.tallShots ? this.tallShots : this.wideShots;
    if (shots !== this.shots) {
      this.shots = shots;
      this.fallback = this.held(shots);
    }
    this.camera.fov = upright ? uprightFov : this.lens;
    const framed = !this.follow ? liteAspect : upright ? tallAspect : framedAspect;
    this.fit = Math.max(1, framed / (width / height));
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
    this.frameY = goal.frameY;
  }

  /**
   * Moves the camera; `time` is the time of the scene (frozen while paused, so the drone holds still), `intro` the
   * time into the opening shot, null once it is over. True while the camera still moves towards its goal.
   */
  update(dt: number, time: number, intro: number | null): boolean {
    const goal = this.target();
    if (intro !== null) {
      const k = smooth(intro / introSeconds);
      this.pos.lerpVectors(this.shots.intro.pos, goal.pos, 1 - (1 - k) ** 2.2);
      this.look.lerpVectors(this.shots.intro.look, goal.look, smooth(intro / (introSeconds * 0.8)));
      this.frame = MathUtils.lerp(0.5, goal.frame, k);
      this.frameY = MathUtils.lerp(0.5, goal.frameY, k);
    } else {
      const k = 1 - Math.pow(damping, dt);
      this.pos.lerp(goal.pos, k);
      this.look.lerp(goal.look, k);
      this.frame = MathUtils.lerp(this.frame, goal.frame, k);
      this.frameY = MathUtils.lerp(this.frameY, goal.frameY, k);
    }
    this.aim(time);
    const still =
      this.pos.distanceToSquared(goal.pos) < 1e-6 &&
      this.look.distanceToSquared(goal.look) < 1e-6 &&
      Math.abs(this.frame - goal.frame) < 1e-4 &&
      Math.abs(this.frameY - goal.frameY) < 1e-4;
    return intro !== null || !still;
  }

  private aim(time: number): void {
    this.drift.set(Math.sin(time * 0.21) * 0.35, Math.sin(time * 0.33) * 0.18, Math.cos(time * 0.17) * 0.35);
    this.camera.position.copy(this.pos).add(this.drift);
    if (!this.follow) {
      const swing = Math.sin(time * 0.05) * 0.45;
      this.camera.position.sub(this.look).applyAxisAngle(up, swing).add(this.look);
    }
    this.camera.lookAt(this.look);
    this.project();
  }

  /**
   * Draws the look point at `frame` of the window width and `frameY` of its height: the view of a window of the same
   * size shifted across and down, or no offset at all in the middle. Set again only when the shift changes by half a
   * pixel or the size changes.
   */
  private project(): void {
    const shift = Math.round((0.5 - this.frame) * this.width * 2) / 2;
    const lift = Math.round((0.5 - this.frameY) * this.height * 2) / 2;
    if (shift === this.shift && lift === this.lift) return;
    this.shift = shift;
    this.lift = lift;
    if (shift === 0 && lift === 0) this.camera.clearViewOffset();
    else this.camera.setViewOffset(this.width, this.height, shift, lift, this.width, this.height);
  }

  private target(): Goal {
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
    this.goal.frameY = MathUtils.lerp(from.frameY, to.frameY, t);
    // Steps back for a frame narrower than the shots are framed for, and for a narrow room beside a panel.
    const room = MathUtils.lerp(from.room, to.room, t);
    const back = this.fit * MathUtils.clamp(framedRoom / room, 1, roomBack);
    if (back > 1) this.goal.pos.sub(this.goal.look).multiplyScalar(back).add(this.goal.look);
    // Half way between two shots the drone flies a little higher, over the towers.
    this.goal.pos.y += Math.sin(t * Math.PI) * from.shot.pos.distanceTo(to.shot.pos) * 0.12;
    return this.goal;
  }
}
