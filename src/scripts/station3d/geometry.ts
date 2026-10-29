import {
  BoxGeometry,
  CapsuleGeometry,
  CurvePath,
  CylinderGeometry,
  Group,
  LineCurve3,
  Mesh,
  QuadraticBezierCurve3,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import type { SceneModel, XY } from './model';
import type { Palette } from './tokens';

/** 40 map units make one scene unit; the map y runs along the scene z. */
export const unit = 1 / 40;

/** Height of the tracks above the ground. */
export const trackY = 0.18;

/** Point of the desktop map in the scene, at `height` above the ground. */
export type ToWorld = (xy: XY, height?: number) => Vector3;

/** Map to scene, the middle of the map on the origin. */
export function mapToWorld(model: SceneModel): ToWorld {
  const cx = model.width / 2;
  const cy = model.height / 2;
  return ([x, y], height = 0) => new Vector3((x - cx) * unit, height, (y - cy) * unit);
}

/** Path through `points` with every bend rounded off (`radius` in scene units), as the map draws its tracks. */
export function roundedPath(points: Vector3[], radius = 0.32): CurvePath<Vector3> {
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

export type Network = {
  group: Group;
  /** Track of each line by route number, from its start to the shared end: the trains run on it. */
  paths: Map<number, CurvePath<Vector3>>;
};

/**
 * The network of the map in the scene: each track a glowing tube over a dark bed with its colour spilled on the
 * ground; stations as rings on a disc of the page background; interchanges as light capsules with an ink edge (a
 * round stop at a crossing); a bar across the start of each line and one across the shared end.
 */
export function buildNetwork(model: SceneModel, at: ToWorld, palette: Palette): Network {
  const group = new Group();
  const paths = new Map<number, CurvePath<Vector3>>();
  const fill = palette.standard('--interchange-fill', { emissive: 0.6, roughness: 0.4 });
  const ink = palette.standard('--interchange-stroke', { roughness: 0.6 });
  const disc = palette.standard('--bg', { roughness: 0.6 });
  const bed = palette.standard('--surface-2', { roughness: 0.7, metalness: 0.2 });
  const discShape = new CylinderGeometry(0.15, 0.15, 0.1, 32);
  const ringShape = new TorusGeometry(0.15, 0.045, 12, 40);
  const barShape = new BoxGeometry(0.5, 0.12, 0.09);

  model.lines.forEach((line) => {
    const path = roundedPath(line.track.map((xy) => at(xy, trackY)));
    paths.set(line.number, path);
    const segments = Math.ceil(path.getLength() * 24);
    const lit = palette.standard(line.token, { emissive: 1.9, roughness: 0.3 });
    const lamp = palette.standard(line.token, { emissive: 1.4 });
    const core = new Mesh(new TubeGeometry(path, segments, 0.055, 10, false), lit);
    const base = new Mesh(new TubeGeometry(path, segments, 0.13, 8, false), bed);
    base.scale.y = 0.45;
    const glow = palette.halo(line.token, 0.05);
    const spill = new Mesh(new TubeGeometry(path, Math.ceil(segments / 2), 0.32, 6, false), glow);
    spill.scale.y = 0.02;
    group.add(base, core, spill);

    const first = at(line.track[0], trackY);
    const along = at(line.track[1], trackY).sub(first);
    const bar = new Mesh(barShape, lamp);
    bar.position.copy(first);
    bar.rotation.y = Math.atan2(along.x, along.z);
    group.add(bar);

    model.stations
      .filter((station) => station.line === line.number)
      .forEach((station) => {
        const point = at(station.xy, trackY);
        const stop = new Mesh(discShape, disc);
        stop.position.copy(point);
        const ring = new Mesh(ringShape, lamp);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(point).setY(trackY + 0.05);
        group.add(stop, ring);
      });
  });

  // Capsules span the parallel tracks they join, side by side along x as on the map.
  const capsules = new Map<number, [CapsuleGeometry, CapsuleGeometry]>();
  const crossShape = new CylinderGeometry(0.17, 0.17, 0.14, 32);
  model.interchanges.forEach((item) => {
    if (item.crossing) {
      const stop = new Mesh(crossShape, fill);
      stop.position.copy(at(item.xy, trackY + 0.04));
      group.add(stop);
      return;
    }
    const length = (item.tracks - 1) * model.gap * unit;
    const shapes: [CapsuleGeometry, CapsuleGeometry] = capsules.get(length) ?? [
      new CapsuleGeometry(0.13, length, 8, 20),
      new CapsuleGeometry(0.16, length, 8, 20),
    ];
    capsules.set(length, shapes);
    const cap = new Mesh(shapes[0], fill);
    const edge = new Mesh(shapes[1], ink);
    cap.rotation.z = Math.PI / 2;
    edge.rotation.z = Math.PI / 2;
    cap.scale.set(1, 1, 0.7);
    edge.scale.set(1, 1, 0.6);
    cap.position.copy(at(item.xy, trackY + 0.12));
    edge.position.copy(at(item.xy, trackY + 0.06));
    group.add(edge, cap);
  });

  // One light bar across the ends of all the lines, the stop of the shared end.
  const ends = model.lines.map((line) => line.track[line.track.length - 1]);
  const xs = ends.map(([x]) => x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const y = ends.reduce((sum, [, endY]) => sum + endY, 0) / ends.length;
  const endBar = new Mesh(new BoxGeometry((right - left + model.radius * 2) * unit, 0.14, 0.1), fill);
  endBar.position.copy(at([(left + right) / 2, y], trackY));
  group.add(endBar);

  return { group, paths };
}
