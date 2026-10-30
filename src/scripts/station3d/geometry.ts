import {
  BufferGeometry,
  CurvePath,
  Float32BufferAttribute,
  LineCurve3,
  QuadraticBezierCurve3,
  Vector3,
} from 'three';
import type { SceneModel, XY } from './model';

/** 10 map units make one scene unit; the map y runs along the scene z. */
export const unit = 1 / 10;

/** Point of the desktop map in the scene, at `height` above the ground. */
export type ToWorld = (xy: XY, height?: number) => Vector3;

/** Map to scene, the middle of the desktop map on the origin. */
export function mapToWorld(model: SceneModel): ToWorld {
  const cx = model.width / 2;
  const cy = model.height / 2;
  return ([x, y], height = 0) => new Vector3((x - cx) * unit, height, (y - cy) * unit);
}

/** Path through `points` with every bend rounded off (`radius` in scene units), as the map draws its tracks. */
export function roundedPath(points: Vector3[], radius = 1.2): CurvePath<Vector3> {
  const path = new CurvePath<Vector3>();
  let from = points[0].clone();
  for (let index = 1; index < points.length - 1; index += 1) {
    const [before, corner, after] = [points[index - 1], points[index], points[index + 1]];
    const r = Math.min(radius, before.distanceTo(corner) / 2, corner.distanceTo(after) / 2);
    const enter = corner.clone().add(before.clone().sub(corner).normalize().multiplyScalar(r));
    const leave = corner.clone().add(after.clone().sub(corner).normalize().multiplyScalar(r));
    if (from.distanceTo(enter) > 1e-4) path.add(new LineCurve3(from, enter));
    path.add(new QuadraticBezierCurve3(enter, corner.clone(), leave));
    from = leave;
  }
  path.add(new LineCurve3(from, points[points.length - 1].clone()));
  return path;
}

/** A point of a path, the direction of the path there, and the level unit vector across it. */
export type Frame = { point: Vector3; tangent: Vector3; side: Vector3 };

const up = new Vector3(0, 1, 0);

export function newFrame(): Frame {
  return { point: new Vector3(), tangent: new Vector3(), side: new Vector3() };
}

/** Frame of `path` at `u` (0 to 1 of its length), its point moved `side` units across; written into `out`. */
export function frameAt(path: CurvePath<Vector3>, u: number, side = 0, out: Frame = newFrame()): Frame {
  path.getPointAt(Math.min(Math.max(u, 0), 1), out.point);
  path.getTangentAt(Math.min(Math.max(u, 0.0001), 0.9999), out.tangent);
  out.side.crossVectors(out.tangent, up).normalize();
  out.point.addScaledVector(out.side, side);
  return out;
}

/** Length along `path` of its point nearest to `target`, measured on the ground plan (x and z). */
export function distanceAlong(path: CurvePath<Vector3>, target: Vector3): number {
  const steps = 600;
  const point = new Vector3();
  let best = 0;
  let least = Infinity;
  for (let index = 0; index <= steps; index += 1) {
    path.getPointAt(index / steps, point);
    const distance = (point.x - target.x) ** 2 + (point.z - target.z) ** 2;
    if (distance < least) {
      least = distance;
      best = index / steps;
    }
  }
  return best * path.getLength();
}

/** Section of a swept box: left, right, bottom and top, in units across and up from the path. */
export type Section = [number, number, number, number];

/**
 * A box section swept along a path, each face a strip of its own so the edges stay hard; `step` is the length of a
 * slice. The u coordinate runs along the path in scene units, so a texture repeats once a unit.
 */
export function sweepBox(path: CurvePath<Vector3>, section: Section, step = 0.25): BufferGeometry {
  const [left, right, bottom, top] = section;
  const corners: [number, number][] = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ];
  const length = path.getLength();
  const count = Math.max(2, Math.ceil(length / step));
  const frames = Array.from({ length: count + 1 }, (_, index) => frameAt(path, index / count));
  const at = (frame: Frame, [across, rise]: [number, number]) =>
    frame.point.clone().addScaledVector(frame.side, across).addScaledVector(up, rise);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const normal = new Vector3();
  const other = new Vector3();
  for (let face = 0; face < 4; face += 1) {
    const [a, c] = [corners[face], corners[(face + 1) % 4]];
    for (let index = 0; index < count; index += 1) {
      const [from, to] = [frames[index], frames[index + 1]];
      const quad = [at(from, a), at(from, c), at(to, c), at(to, a)];
      normal.subVectors(quad[1], quad[0]).cross(other.subVectors(quad[3], quad[0])).normalize();
      [0, 1, 2, 0, 2, 3].forEach((k) => {
        positions.push(quad[k].x, quad[k].y, quad[k].z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(((k === 2 || k === 3 ? index + 1 : index) / count) * length, k === 1 || k === 2 ? 1 : 0);
      });
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  return geometry;
}
