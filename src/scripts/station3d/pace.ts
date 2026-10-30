import type { Layout } from './level';

/**
 * What each layout can afford: multisampling of the post-processing; the largest pixel ratio of the canvas and the
 * lowest it steps down to when frames take too long; the shadow map of the sun and the half width of the box it
 * covers round the look point.
 */
export type Quality = { samples: number; maxRatio: number; minRatio: number; shadow: { size: number; reach: number } };

export const quality: Record<Layout, Quality> = {
  wide: { samples: 4, maxRatio: 1.25, minRatio: 0.7, shadow: { size: 2048, reach: 46 } },
  narrow: { samples: 2, maxRatio: 1.25, minRatio: 0.6, shadow: { size: 1024, reach: 46 } },
  lite: { samples: 2, maxRatio: 1.5, minRatio: 0.7, shadow: { size: 1024, reach: 30 } },
};

const ratioStep = 0.15;
/** Seconds a frame may take before it counts as slow. */
const slowFrame = 0.024;
/**
 * At its lowest pixel ratio the full level times its frames over `judged` seconds: a mean frame longer than `tooSlow`
 * seconds means this device cannot run it.
 */
const judged = 4;
const tooSlow = 0.045;

/**
 * Pixel ratio of the canvas, kept to what the device can draw: slow frames build up `slow`; past 0.6 the ratio steps
 * down, at most once every 2s. At the lowest ratio the full level times its frames from 1s after the last step.
 */
export class Pace {
  ratio: number;
  private readonly tier: Quality;
  private readonly full: boolean;
  private slow = 0;
  private steppedAt = 0;
  private spent = 0;
  private timed = 0;

  /** `full`: the full level, which gives way when it is still too slow at its lowest ratio. */
  constructor(tier: Quality, full: boolean) {
    this.tier = tier;
    this.full = full;
    this.ratio = Math.min(devicePixelRatio, tier.maxRatio);
  }

  /**
   * Counts a frame of `dt` seconds drawn at `now`: 'step' when the ratio has just stepped down (the canvas must be
   * sized again), 'slow' when the full level is still too slow at its lowest ratio, null otherwise.
   */
  check(now: number, dt: number): 'step' | 'slow' | null {
    this.slow = this.slow * 0.95 + (dt > slowFrame ? 0.05 : 0);
    if (this.ratio > this.tier.minRatio) {
      if (this.slow <= 0.6 || now - this.steppedAt <= 2000) return null;
      this.ratio = Math.max(this.tier.minRatio, this.ratio - ratioStep);
      this.steppedAt = now;
      this.slow = 0;
      return 'step';
    }
    if (!this.full || dt === 0 || now - this.steppedAt < 1000) return null;
    this.spent += dt;
    this.timed += 1;
    if (this.spent < judged) return null;
    const mean = this.spent / this.timed;
    this.spent = 0;
    this.timed = 0;
    return mean > tooSlow ? 'slow' : null;
  }
}
