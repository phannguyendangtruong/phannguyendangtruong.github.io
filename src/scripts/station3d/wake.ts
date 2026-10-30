import { MathUtils, Vector2, type IUniform, type MeshStandardMaterial } from 'three';

/** Largest distance from the end the wave has to travel to have crossed the whole city. */
const reach = 150;

/** Smooth step from 0 at `from` to 1 at `to`, clamped. */
export function smooth(from: number, to: number, value: number): number {
  const x = MathUtils.clamp((value - from) / (to - from), 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * GLSL of the wave: `wakeAt(p, jitter)` goes from 0 to 1 as the wave passes the ground point `p`, each light a little
 * early or late by its `jitter` (0 to 1). Every shader that uses it takes the uniforms of `Wake.uniforms`.
 */
export const wakeGlsl = `
  uniform float uWake; uniform vec2 uWakeCenter;
  float wakeAt(vec2 p, float jitter) { return smoothstep(0.0, 2.5, uWake - length(p - uWakeCenter) - jitter * 9.0); }`;

/** Uniforms of the wave: its radius from the end (a huge one once the city is lit) and the end on the ground plan. */
export type WakeUniforms = { uWake: IUniform<number>; uWakeCenter: IUniform<Vector2> };

/** A lit material that comes on between `start` and `end` of the wake, at `base` for the theme, times `emphasis`. */
type Lamp = { start: number; end: number; base: number; emphasis: number };

/**
 * The city waking up during the opening shot: a wave spreads from the end over the whole city and the lights come on
 * as it passes. The shaders light their windows, street lights, trails and sparks by their distance to the end
 * (`wakeGlsl`); the lit materials (LED strips, station lights, the glass of the end, the trains) come on over a share
 * of the progress each; the magic follows the progress through `on`. Progress runs from 0 to 1 and stays at 1 once the
 * city is lit: without an opening shot it is 1 from the first frame.
 */
export class Wake {
  readonly uniforms: WakeUniforms = { uWake: { value: 1e4 }, uWakeCenter: { value: new Vector2() } };
  private progress = 1;
  private readonly lamps = new Map<MeshStandardMaterial, Lamp>();
  private readonly listeners: ((progress: number) => void)[] = [];

  /** Progress of the wake, 0 to 1. */
  get value(): number {
    return this.progress;
  }

  /** Distance from the end the wave has reached. */
  get radius(): number {
    return this.uniforms.uWake.value;
  }

  /** Where the wave starts, on the ground plan. */
  centre(x: number, z: number): void {
    this.uniforms.uWakeCenter.value.set(x, z);
  }

  /** Lights `material` between `start` and `end` of the progress, at its emissive intensity now until `setBase`. */
  lamp<T extends MeshStandardMaterial>(material: T, start: number, end: number): T {
    this.lamps.set(material, { start, end, base: material.emissiveIntensity, emphasis: 1 });
    this.apply(material);
    return material;
  }

  /** Emissive intensity of a lamp in the theme in use, once lit. */
  setBase(material: MeshStandardMaterial, base: number): void {
    const lamp = this.lamps.get(material);
    if (!lamp) {
      material.emissiveIntensity = base;
      return;
    }
    lamp.base = base;
    this.apply(material);
  }

  /** Brighter or dimmer than its base (a line the pointer is on, interact.ts). */
  setEmphasis(material: MeshStandardMaterial, emphasis: number): void {
    const lamp = this.lamps.get(material);
    if (!lamp) return;
    lamp.emphasis = emphasis;
    this.apply(material);
  }

  /** Runs `listener` with the progress each time it changes. */
  on(listener: (progress: number) => void): void {
    this.listeners.push(listener);
  }

  /** Moves the wake to `next` (clamped to 0 to 1); nothing changes when it is already there. */
  set(next: number): void {
    const progress = MathUtils.clamp(next, 0, 1);
    if (progress === this.progress) return;
    this.progress = progress;
    this.uniforms.uWake.value = progress >= 1 ? 1e4 : reach * smooth(0, 1, progress);
    this.lamps.forEach((_, material) => this.apply(material));
    this.listeners.forEach((listener) => listener(progress));
  }

  private apply(material: MeshStandardMaterial): void {
    const lamp = this.lamps.get(material);
    if (!lamp) return;
    material.emissiveIntensity = lamp.base * smooth(lamp.start, lamp.end, this.progress) * lamp.emphasis;
  }
}
