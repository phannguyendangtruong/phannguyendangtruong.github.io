import type { ToWorld } from './geometry';
import type { SceneModel } from './model';

/** A point of the ground plan: scene x and z. */
export type XZ = [number, number];

/** A straight stretch of a track on the ground plan, and the route number of its line. */
export type Segment = { a: XZ; b: XZ; line: number };

/** A lot and the building on it: kind 0 a glass tower, 1 housing, 2 a shophouse; `seed` varies its look. */
export type Lot = { x: number; z: number; w: number; d: number; h: number; kind: number; seed: number };

/** Road grid: centre lines every `pitch` units on x and z, asphalt to `road` and pavement to `walk` from the centre. */
export const grid = { pitch: 6, road: 0.55, walk: 0.85 };

/** Half width of the boulevard under a viaduct, and the room kept free of buildings on each side of its middle. */
export const boulevard = { road: 0.9, walk: 1.15, clear: 1.7 };

/** Extent of the city from the middle of the map, and the size of the ground, whose edge the fog hides. */
export const extent = { x: 96, z: 78 };
export const groundSize = { x: extent.x * 2 + 80, z: extent.z * 2 + 80 };

/** Half width of the river, and of the embankment beyond each bank. */
export const riverWidth = { half: 3.2, bank: 0.9 };

/**
 * Course of the river from west to east. It is moved north or south as a whole so that it crosses the trunk
 * `riverBefore` units before the end: the lines come into the end over a bridge, whatever the map.
 */
const riverCourse: XZ[] = [
  [-112, 2],
  [-60, 8],
  [-30, 14],
  [-8, 13],
  [14, 11.5],
  [34, 13],
  [60, 8],
  [112, 14],
];
const riverBefore = 8.2;

/** Middle of the downtown, where the towers stand, from the end: up the trunk, a little to the west of it. */
const downtownFromEnd: XZ = [-6, -18.6];

/** Lite level: only the lots round the trunk and the end are built, within these ranges of x and z from the end. */
const liteArea = { x: [-40, 36], z: [-54.6, 23.4] };

/** Repeatable noise in [0, 1) from up to three numbers: the same city on every visit. */
export function hash(a: number, b: number, c = 0): number {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function toSegment(px: number, pz: number, [ax, az]: XZ, [bx, bz]: XZ): number {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}

/** z of the middle of a course at `x`, between the two points either side of it. */
function courseZ(course: XZ[], x: number): number {
  for (let index = 1; index < course.length; index += 1) {
    const [ax, az] = course[index - 1];
    const [bx, bz] = course[index];
    if (x <= bx || index === course.length - 1) return az + ((bz - az) * (x - ax)) / (bx - ax || 1);
  }
  return course[0][1];
}

/**
 * Plan of the city round the network: the tracks of the lines on the ground plan, the river, the downtown and the
 * lots of every block. Lots keep clear of the boulevards under the viaducts, of the river and of its banks.
 */
export class CityPlan {
  readonly segments: Segment[];
  readonly river: XZ[];
  readonly downtown: XZ;
  private readonly end: XZ;
  private readonly banks: [XZ, XZ][];

  constructor(model: SceneModel, at: ToWorld) {
    this.segments = model.lines.flatMap((line) =>
      line.track.slice(1).map((xy, index): Segment => {
        const a = at(line.track[index]);
        const b = at(xy);
        return { a: [a.x, a.z], b: [b.x, b.z], line: line.number };
      }),
    );
    const end = at(model.end.xy);
    this.end = [end.x, end.z];
    const shift = end.z - riverBefore - courseZ(riverCourse, end.x);
    this.river = riverCourse.map(([x, z]): XZ => [x, z + shift]);
    this.banks = this.river.slice(1).map((point, index): [XZ, XZ] => [this.river[index], point]);
    this.downtown = [end.x + downtownFromEnd[0], end.z + downtownFromEnd[1]];
  }

  /** Distance from the nearest track, on the ground plan. */
  trackDistance(x: number, z: number): number {
    let least = Infinity;
    this.segments.forEach(({ a, b }) => {
      least = Math.min(least, toSegment(x, z, a, b));
    });
    return least;
  }

  /** Distance from the middle of the river. */
  riverDistance(x: number, z: number): number {
    let least = Infinity;
    this.banks.forEach(([a, b]) => {
      least = Math.min(least, toSegment(x, z, a, b));
    });
    return least;
  }

  /** A block of the grid left as a park: a few by chance, away from the downtown. */
  isPark(bx: number, bz: number): boolean {
    const cx = bx * grid.pitch + grid.pitch / 2;
    const cz = bz * grid.pitch + grid.pitch / 2;
    const d = Math.hypot(cx - this.downtown[0], cz - this.downtown[1]);
    return d > 16 && hash(bx, bz, 7) < 0.07;
  }

  /**
   * Lots of every block: one, two or four a block, each a building of a kind with a seed. `lite` keeps only the lots
   * round the trunk and the end.
   */
  lots(lite: boolean): Lot[] {
    const lots: Lot[] = [];
    const inner = grid.pitch / 2 - grid.walk - 0.1;
    for (let bx = Math.floor(-extent.x / grid.pitch); bx < extent.x / grid.pitch; bx += 1) {
      for (let bz = Math.floor(-extent.z / grid.pitch); bz < extent.z / grid.pitch; bz += 1) {
        if (this.isPark(bx, bz)) continue;
        const cx = bx * grid.pitch + grid.pitch / 2;
        const cz = bz * grid.pitch + grid.pitch / 2;
        const split = hash(bx, bz, 1);
        const parts: [number, number, number, number][] =
          split < 0.25
            ? [[0, 0, 1, 1]]
            : split < 0.6
              ? [[-0.5, 0, 0.5, 1], [0.5, 0, 0.5, 1]]
              : [[-0.5, -0.5, 0.5, 0.5], [0.5, -0.5, 0.5, 0.5], [-0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]];
        const swap = hash(bx, bz, 2) < 0.5;
        parts.forEach(([ox, oz, sx, sz], index) => {
          const [px, pz, qx, qz] = swap ? [oz, ox, sz, sx] : [ox, oz, sx, sz];
          const x = cx + px * inner;
          const z = cz + pz * inner;
          const w = qx * inner * 2 - 0.22;
          const d = qz * inner * 2 - 0.22;
          const reach = Math.hypot(w, d) / 2;
          if (lite && !this.inLiteArea(x, z)) return;
          if (this.trackDistance(x, z) < boulevard.clear + reach * 0.8) return;
          if (this.riverDistance(x, z) < riverWidth.half + riverWidth.bank + reach) return;
          const r = hash(bx * 4 + index, bz, 5);
          const h = this.heightAt(x, z, r) * (parts.length === 1 ? 1 : 0.85 + 0.3 * hash(index, bx, bz));
          const kind = h > 6.5 ? 0 : h > 2.6 ? 1 : 2;
          lots.push({ x, z, w, d, h, kind, seed: hash(bx, bz, index + 9) });
        });
      }
    }
    return lots;
  }

  /** Height of a building: tall in the downtown, low at the edge of the city, a few towers anywhere near it. */
  private heightAt(x: number, z: number, r: number): number {
    const d = Math.hypot(x - this.downtown[0], z - this.downtown[1]);
    const top = 1.6 + 15 * Math.exp(-((d / 24) ** 2)) + 3 * Math.exp(-((d / 60) ** 2));
    let h = 0.7 + (top - 0.7) * r ** 1.8;
    if (r > 0.93 && d < 45) h = Math.max(h, 6 + 8 * hash(x, z, 3));
    return h;
  }

  private inLiteArea(x: number, z: number): boolean {
    const dx = x - this.end[0];
    const dz = z - this.end[1];
    return dx > liteArea.x[0] && dx < liteArea.x[1] && dz > liteArea.z[0] && dz < liteArea.z[1];
  }
}
