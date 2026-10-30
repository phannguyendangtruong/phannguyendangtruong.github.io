import { MathUtils, Vector2, Vector3, type PerspectiveCamera } from 'three';

/** Largest roll of the drone into a turn, in radians, and the roll a unit a second of sideways flight gives it. */
const maxBank = 0.07;
const bankPerSpeed = 0.01;

/** Share of the way to its roll the drone still has to go after one second. */
const bankDamping = 0.08;

/** Turn round the look point with the pointer at the edge of the window: across (yaw) and down (pitch), in radians. */
const yaw = 0.07;
const pitch = 0.04;

/** Share of the way to the pointer the lean still has to go after one second. */
const leanDamping = 0.05;

const up = new Vector3(0, 1, 0);

/**
 * How the drone sways on top of its flight (camera.ts): it banks a little into a turn while flying sideways between
 * two shots, and at the full level it leans a few degrees round its look point towards the pointer. Both stop, at
 * once, while the animation is paused (`steady`).
 */
export class Sway {
  /** Pointer over the window, from -1 to 1 across (left to right) and down (top to bottom). */
  readonly pointer = new Vector2();
  /** The drone leans towards the pointer (the full level, interact.ts). */
  leans = false;
  /** Paused: no bank and no lean. */
  steady = false;
  private bank = 0;
  private readonly lean = new Vector2();
  private readonly target = new Vector2();
  private readonly last = new Vector3();
  private started = false;
  private readonly forward = new Vector3();
  private readonly right = new Vector3();
  private readonly moved = new Vector3();
  private readonly offset = new Vector3();
  private readonly axis = new Vector3();

  /**
   * Sways `camera`, already placed by the rig: `pos` and `look` are the rig's point and look point, `goal` the point
   * it flies to (its moves across the view make the bank), `dt` seconds since the last frame. Sets the up of the
   * camera; call before it looks at `look`.
   */
  apply(camera: PerspectiveCamera, pos: Vector3, look: Vector3, goal: Vector3, dt: number): void {
    this.forward.subVectors(look, pos).normalize();
    this.right.crossVectors(this.forward, up).normalize();
    const sideways = this.started && dt > 0 ? this.moved.subVectors(goal, this.last).dot(this.right) / dt : 0;
    this.last.copy(goal);
    this.started = true;
    if (this.steady) {
      this.bank = 0;
      this.lean.set(0, 0);
    } else {
      const roll = MathUtils.clamp(-sideways * bankPerSpeed, -maxBank, maxBank);
      this.bank = MathUtils.lerp(this.bank, roll, 1 - Math.pow(bankDamping, dt));
      if (this.leans) this.target.copy(this.pointer);
      else this.target.set(0, 0);
      this.lean.lerp(this.target, 1 - Math.pow(leanDamping, dt));
    }
    camera.up.copy(up).applyAxisAngle(this.forward, this.bank);
    if (this.lean.lengthSq() < 1e-8) return;
    this.offset.subVectors(camera.position, look).applyAxisAngle(up, -this.lean.x * yaw);
    this.axis.crossVectors(this.offset, up).normalize();
    this.offset.applyAxisAngle(this.axis, this.lean.y * pitch);
    camera.position.copy(look).add(this.offset);
  }
}
