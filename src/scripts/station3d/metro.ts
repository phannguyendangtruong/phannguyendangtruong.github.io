import {
  BoxGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type CurvePath,
} from 'three';
import type { Kit } from './assets';
import { distanceAlong, frameAt, newFrame, roundedPath, sweepBox, type ToWorld } from './geometry';
import type { SceneLine, SceneModel } from './model';

export type Metro = {
  group: Group;
  /** Track of each line by route number, from its start to the end, on its deck: the trains run on it. */
  paths: Map<number, CurvePath<Vector3>>;
  /** Stops of each line (its stations and the hubs), as lengths along its path, in order. */
  stops: Map<number, number[]>;
  /** Length along the path of each line where it reaches the end. */
  ends: Map<number, number>;
};

/** Height of the decks over the ground. */
export const deckY = 1.6;

/** Distance of each of the two tracks of a viaduct from its middle. */
export const trackSide = 0.22;

/** A line riding over another at a crossing is this much higher, and comes down to the common deck over `ramp`. */
const rise = 0.75;
const ramp = 12;

/** Share of the way from `a` to `b` of the point of that stretch nearest to `point`, on the ground plan. */
function shareOf(a: Vector3, b: Vector3, point: Vector3): number {
  const ab = b.clone().sub(a).setY(0);
  return Math.max(0, Math.min(1, point.clone().sub(a).setY(0).dot(ab) / Math.max(ab.lengthSq(), 1e-9)));
}

/** Distance on the ground plan from `point` to the stretch from `a` to `b`. */
function offStretch(a: Vector3, b: Vector3, point: Vector3): number {
  const nearest = a.clone().lerp(b, shareOf(a, b, point));
  return Math.hypot(nearest.x - point.x, nearest.z - point.z);
}

/** Lines whose track passes within 0.3 units of `point`. */
function linesThrough(model: SceneModel, at: ToWorld, point: Vector3): number[] {
  return model.lines
    .filter((line) => line.track.some((xy, i) => i > 0 && offStretch(at(line.track[i - 1]), at(xy), point) < 0.3))
    .map((line) => line.number);
}

/** Length along the track through `points` (`along` is the length up to each point) of its point nearest `spot`. */
function alongTrack(points: Vector3[], along: number[], spot: Vector3): number {
  let best = 0;
  let least = Infinity;
  points.slice(1).forEach((point, index) => {
    const off = offStretch(points[index], point, spot);
    if (off >= least) return;
    least = off;
    best = along[index] + shareOf(points[index], point, spot) * (along[index + 1] - along[index]);
  });
  return best;
}

/**
 * Deck height at each point of a track. At a crossing (a round interchange) every line but the highest numbered one
 * through it rides over the others: high from its start to the first bend after the crossing, then down to the
 * common deck over `ramp` units, before it joins the trunk. The end is always at the common deck.
 */
function heightsOf(line: SceneLine, model: SceneModel, at: ToWorld): number[] {
  const points = line.track.map((xy) => at(xy));
  const along = [0];
  points.slice(1).forEach((point, index) => along.push(along[index] + point.distanceTo(points[index])));
  const crossings = model.interchanges
    .filter((item) => item.crossing)
    .map((item) => at(item.xy))
    .filter((spot) => {
      const through = linesThrough(model, at, spot);
      return through.includes(line.number) && through.length > 1 && Math.max(...through) !== line.number;
    })
    .map((spot) => alongTrack(points, along, spot));
  const flat = points.map(() => deckY);
  if (crossings.length === 0) return flat;
  const crossing = Math.max(...crossings);
  const bend = along.findIndex((length) => length > crossing + 1e-6);
  if (bend < 0) return flat;
  return points.map((_, index) => {
    if (index === points.length - 1) return deckY;
    if (index <= bend) return deckY + rise;
    return deckY + rise * Math.max(0, 1 - (along[index] - along[bend]) / ramp);
  });
}

/**
 * Viaducts of the lines: a concrete deck on piers, parapets with an LED strip in the line colour under the deck edge
 * (paint of that colour by day), two tracks of steel rails on sleepers. Gives the paths the trains run on and the
 * stops of each line.
 */
export function buildMetro(model: SceneModel, at: ToWorld, kit: Kit): Metro {
  const group = new Group();
  const { assets } = kit;
  const concrete = new MeshStandardMaterial({
    map: assets.concrete,
    normalMap: assets.concreteNormal,
    color: 0x5c5c5e,
    roughness: 0.85,
    envMapIntensity: 0.25,
  });
  const steel = new MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.25, metalness: 1 });
  const sleeperPaint = new MeshStandardMaterial({ color: 0x3a3836, roughness: 0.9 });
  kit.theme.on((day) => {
    concrete.color.set(day ? 0xcfccc6 : 0x5c5c5e);
    concrete.envMapIntensity = day ? 0.7 : 0.25;
    sleeperPaint.color.set(day ? 0x8a8580 : 0x3a3836);
  });
  const paths = new Map<number, CurvePath<Vector3>>();
  const stops = new Map<number, number[]>();
  const ends = new Map<number, number>();
  const sleepers: Matrix4[] = [];
  const column = new BoxGeometry(0.26, 1, 0.26);
  const cap = new BoxGeometry(0.9, 0.16, 0.36);
  const up = new Vector3(0, 1, 0);
  const frame = newFrame();
  const basis = new Matrix4();

  model.lines.forEach((line) => {
    const heights = heightsOf(line, model, at);
    const path = roundedPath(line.track.map((xy, index) => at(xy, heights[index])));
    const length = path.getLength();
    paths.set(line.number, path);
    const color = kit.colors.of(line.number);
    const led = new MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 2.4 });
    kit.theme.on((day) => {
      led.color.set(day ? color : 0x000000);
      led.emissive.copy(color);
      led.emissiveIntensity = day ? 0.1 : 2.4;
    });
    group.add(
      new Mesh(sweepBox(path, [-0.52, 0.52, -0.2, 0]), concrete),
      new Mesh(sweepBox(path, [-0.52, -0.47, 0, 0.09]), concrete),
      new Mesh(sweepBox(path, [0.47, 0.52, 0, 0.09]), concrete),
      new Mesh(sweepBox(path, [-0.535, -0.52, -0.16, -0.13]), led),
      new Mesh(sweepBox(path, [0.52, 0.535, -0.16, -0.13]), led),
    );
    [-trackSide, trackSide].forEach((offset) => {
      [-0.075, 0.075].forEach((rail) => {
        group.add(new Mesh(sweepBox(path, [offset + rail - 0.012, offset + rail + 0.012, 0.03, 0.055], 0.3), steel));
      });
    });

    for (let s = 0.05; s < length; s += 0.11) {
      frameAt(path, s / length, 0, frame);
      basis.makeBasis(frame.side, up, frame.tangent);
      [-trackSide, trackSide].forEach((offset) => {
        const position = frame.point.clone().addScaledVector(frame.side, offset).add(new Vector3(0, 0.015, 0));
        sleepers.push(basis.clone().setPosition(position));
      });
    }
    // Piers: a column and a cap every 3.2 units, the column reaching down into the ground.
    for (let s = 1.2; s < length - 0.5; s += 3.2) {
      frameAt(path, s / length, 0, frame);
      const height = frame.point.y - 0.2;
      const turn = Math.atan2(frame.tangent.x, frame.tangent.z);
      const pier = new Mesh(column, concrete);
      pier.scale.y = height + 0.4;
      pier.position.set(frame.point.x, height / 2 - 0.2, frame.point.z);
      pier.rotation.y = turn;
      const head = new Mesh(cap, concrete);
      head.position.set(frame.point.x, frame.point.y - 0.28, frame.point.z);
      head.rotation.y = turn;
      group.add(pier, head);
    }

    const own = model.stations.filter((station) => station.line === line.number).map((station) => at(station.xy));
    const hubs = model.interchanges.filter((item) => item.hub).map((item) => at(item.xy));
    stops.set(line.number, [...own, ...hubs].map((point) => distanceAlong(path, point)).sort((a, b) => a - b));
    ends.set(line.number, distanceAlong(path, at(model.end.xy)));
  });

  const ties = new InstancedMesh(new BoxGeometry(0.24, 0.02, 0.04), sleeperPaint, sleepers.length);
  sleepers.forEach((matrix, index) => ties.setMatrixAt(index, matrix));
  group.add(ties);
  return { group, paths, stops, ends };
}
