import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3,
  type BufferGeometry,
  type CurvePath,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Kit } from './assets';
import { frameAt, newFrame } from './geometry';
import { trackSide, type Metro } from './metro';
import type { SceneModel } from './model';
import { carWindowTexture } from './textures';

const car = { length: 1.15, gap: 0.05, count: 4 };
const trainLength = car.count * car.length + (car.count - 1) * car.gap;
/** Top speed in scene units a second, share of a run spent speeding up (and as much braking), seconds at a stop. */
const topSpeed = 2.6;
const ramp = 0.22;
const dwell = 2.2;

/** A run between two stops: when it starts in the cycle, how long it takes, and its lengths along the path. */
type Leg = { start: number; duration: number; from: number; to: number };
type Timetable = { legs: Leg[]; cycle: number };

/** Beam an end car casts ahead on the deck; `sign` is 1 for the front car, -1 for the last. */
type Head = { beam: Mesh<PlaneGeometry, MeshBasicMaterial>; sign: number };

type Train = {
  cars: Group[];
  heads: Head[];
  path: CurvePath<Vector3>;
  table: Timetable;
  side: number;
  phase: number;
  lamps: { front: MeshBasicMaterial; back: MeshBasicMaterial };
};

/** Share of a leg covered at `tau` (0 to 1 of its time): speeding up, running, braking. */
function ease(tau: number): number {
  if (tau < ramp) return (tau * tau) / (2 * ramp) / (1 - ramp);
  if (tau > 1 - ramp) return 1 - ((1 - tau) * (1 - tau)) / (2 * ramp) / (1 - ramp);
  return (tau - ramp / 2) / (1 - ramp);
}

/** Out of the portal at the start of the line, stopping at every stop, to the end and back the same way. */
function timetable(stops: number[], end: number): Timetable {
  const points = [-trainLength - 0.3, ...stops.filter((s) => s > 0.5 && s < end - 0.5), end - 0.25];
  const back = [...points].reverse();
  const runs = [
    ...points.slice(1).map((s, index): [number, number] => [points[index], s]),
    ...back.slice(1).map((s, index): [number, number] => [back[index], s]),
  ];
  const legs: Leg[] = [];
  let time = 0;
  runs.forEach(([from, to]) => {
    const duration = Math.abs(to - from) / topSpeed / (1 - ramp) + 0.4;
    legs.push({ start: time, duration, from, to });
    time += duration + dwell;
  });
  return { legs, cycle: time };
}

/** Length along the path of the head of a train at `time`, and its direction: 1 towards the end, -1 back. */
function where({ legs, cycle }: Timetable, time: number): { s: number; dir: number } {
  const local = ((time % cycle) + cycle) % cycle;
  for (const leg of legs) {
    const dir = Math.sign(leg.to - leg.from);
    if (local < leg.start) return { s: leg.from, dir };
    if (local <= leg.start + leg.duration) {
      return { s: leg.from + (leg.to - leg.from) * ease((local - leg.start) / leg.duration), dir };
    }
  }
  const last = legs[legs.length - 1];
  return { s: last.to, dir: Math.sign(last.to - last.from) };
}

/** Merges `parts` into one geometry and frees them. */
function merged(parts: BufferGeometry[]): BufferGeometry {
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error('Cảnh 3D: không ghép được chi tiết toa tàu (trains.ts)');
  return geometry;
}

/** Door seams down both sides (two doors a side) and two air-conditioning units on the roof: one geometry each. */
function carDetails(): { seams: BufferGeometry; roof: BufferGeometry } {
  const parts: BufferGeometry[] = [];
  [-0.3, 0.3].forEach((z) => {
    [-0.075, 0.075].forEach((dz) => parts.push(new BoxGeometry(0.308, 0.21, 0.008).translate(0, 0.2, z + dz)));
    parts.push(new BoxGeometry(0.308, 0.008, 0.15).translate(0, 0.304, z));
  });
  const units = [-0.32, 0.32].map((z) => new BoxGeometry(0.17, 0.04, 0.26).translate(0, 0.38, z));
  return { seams: merged(parts), roof: merged(units) };
}

export type Trains = { group: Group; update: (time: number) => void };

/**
 * Two trains a line, one on each track, shuttling between the portal at the start of the line and the end, stopping
 * at every station and hub: silver cars with a band of warm lit windows and a stripe of the line colour (paint of that
 * colour by day), door seams down the sides and two air-conditioning units on the roof; at each cab end a raked dark
 * windscreen with a faint cab light and a sign of the line colour over it; white lamps at the end that leads, red at
 * the end that trails, a soft beam on the deck ahead by night. Cars still behind the portal are hidden, so a train
 * slides out of the ring of light car by car. During the wake the windows come on a quarter of the way in, the
 * stripes and signs a little after (wake.ts).
 */
export function buildTrains(model: SceneModel, metro: Metro, kit: Kit): Trains {
  const group = new Group();
  const body = new MeshStandardMaterial({ color: 0xc9cdd3, roughness: 0.3, metalness: 0.7, envMapIntensity: 0.8 });
  const glass = kit.wake.lamp(
    new MeshStandardMaterial({
      color: 0x050608,
      emissive: 0xffffff,
      emissiveMap: kit.own(carWindowTexture()),
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.4,
    }),
    0.25,
    0.5,
  );
  const shell = new RoundedBoxGeometry(0.3, 0.3, car.length, 3, 0.07);
  const band = new BoxGeometry(0.304, 0.085, car.length - 0.16);
  const stripeShape = new BoxGeometry(0.306, 0.022, car.length - 0.1);
  const lampShape = new BoxGeometry(0.05, 0.03, 0.01);
  const beamShape = new PlaneGeometry(0.42, 2.2);
  const { seams, roof } = carDetails();
  const seamPaint = new MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.6, metalness: 0.4 });
  const roofPaint = new MeshStandardMaterial({ color: 0x8d9197, roughness: 0.55, metalness: 0.5 });
  const screenShape = new BoxGeometry(0.24, 0.1, 0.012);
  const screen = new MeshStandardMaterial({
    color: 0x0a0d12,
    roughness: 0.05,
    metalness: 0.6,
    emissive: 0x6a7a90,
    emissiveIntensity: 0.12,
  });
  const signShape = new BoxGeometry(0.14, 0.022, 0.006);
  const head = new Color();
  const tail = new Color();
  const beams: Mesh[] = [];
  const trains: Train[] = [];

  model.lines.forEach((line, index) => {
    const path = metro.paths.get(line.number);
    const end = metro.ends.get(line.number);
    if (!path || end === undefined) return;
    const table = timetable(metro.stops.get(line.number) ?? [], end);
    const color = kit.colors.of(line.number);
    const stripe = kit.wake.lamp(
      new MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 2.2 }),
      0.35,
      0.6,
    );
    const signPaint = kit.wake.lamp(
      new MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 1.8 }),
      0.35,
      0.6,
    );
    kit.theme.on((day) => {
      stripe.color.set(day ? color : 0x000000);
      stripe.emissive.copy(color);
      kit.wake.setBase(stripe, day ? 0.15 : 2.2);
      signPaint.color.set(day ? 0x111111 : 0x000000);
      signPaint.emissive.copy(color);
      kit.wake.setBase(signPaint, day ? 0.5 : 1.8);
    });
    [-1, 1].forEach((side, k) => {
      const lamps = { front: new MeshBasicMaterial(), back: new MeshBasicMaterial() };
      const heads: Head[] = [];
      const cars = Array.from({ length: car.count }, (_, position) => {
        const carGroup = new Group();
        const shellMesh = new Mesh(shell, body);
        shellMesh.position.y = 0.21;
        const bandMesh = new Mesh(band, glass);
        bandMesh.position.y = 0.245;
        const stripeMesh = new Mesh(stripeShape, stripe);
        stripeMesh.position.y = 0.15;
        carGroup.add(shellMesh, bandMesh, stripeMesh, new Mesh(seams, seamPaint), new Mesh(roof, roofPaint));
        if (position === 0 || position === car.count - 1) {
          const sign = position === 0 ? 1 : -1;
          const windscreen = new Mesh(screenShape, screen);
          windscreen.position.set(0, 0.255, sign * (car.length / 2 + 0.001));
          windscreen.rotation.x = sign * 0.12;
          const board = new Mesh(signShape, signPaint);
          board.position.set(0, 0.325, sign * (car.length / 2 + 0.002));
          carGroup.add(windscreen, board);
          [-0.08, 0.08].forEach((x) => {
            const light = new Mesh(lampShape, position === 0 ? lamps.front : lamps.back);
            light.position.set(x, 0.12, sign * (car.length / 2 + 0.002));
            carGroup.add(light);
          });
          const beam = new Mesh(
            beamShape,
            new MeshBasicMaterial({
              map: kit.assets.glow,
              color: 0xfff1d6,
              transparent: true,
              opacity: 0,
              blending: AdditiveBlending,
              depthWrite: false,
            }),
          );
          beam.rotation.x = -Math.PI / 2;
          beam.position.set(0, 0.07, sign * (car.length / 2 + 1.0));
          carGroup.add(beam);
          beams.push(beam);
          heads.push({ beam, sign });
        }
        group.add(carGroup);
        return carGroup;
      });
      const phase = k * table.cycle * 0.5 + index * 3.1;
      trains.push({ cars, heads, path, table, side: side * trackSide, phase, lamps });
    });
  });
  kit.theme.on((day) => {
    kit.wake.setBase(glass, day ? 0.05 : 0.95);
    glass.color.set(day ? 0x22303e : 0x050608);
    screen.emissiveIntensity = day ? 0 : 0.12;
    head.setRGB(1.0, 0.95, 0.85).multiplyScalar(day ? 1.6 : 5);
    tail.setRGB(1.0, 0.05, 0.02).multiplyScalar(day ? 1.2 : 5);
    beams.forEach((beam) => {
      beam.visible = !day;
    });
  });

  const frame = newFrame();
  const basis = new Matrix4();
  const up = new Vector3(0, 1, 0);
  const across = new Vector3();
  const update = (time: number) => {
    trains.forEach((train) => {
      const { s, dir } = where(train.table, time + train.phase);
      const length = train.path.getLength();
      // Car 0 leads on the way to the end, the last car on the way back.
      train.lamps.front.color.copy(dir >= 0 ? head : tail);
      train.lamps.back.color.copy(dir >= 0 ? tail : head);
      train.cars.forEach((carGroup, position) => {
        const at = s - (position * (car.length + car.gap) + car.length / 2);
        carGroup.visible = at > 0.05 && at < length;
        if (!carGroup.visible) return;
        frameAt(train.path, at / length, train.side, frame);
        basis.makeBasis(across.copy(frame.side).negate(), up, frame.tangent);
        carGroup.quaternion.setFromRotationMatrix(basis);
        carGroup.position.copy(frame.point).setY(frame.point.y + 0.03);
      });
      train.heads.forEach(({ beam, sign }) => {
        beam.material.opacity = sign * dir > 0 ? 0.32 : 0;
      });
    });
  };
  return { group, update };
}
