import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  MathUtils,
  Mesh,
  PlaneGeometry,
  SphereGeometry,
  Sprite,
  Vector3,
  type CurvePath,
  type Material,
  type SpriteMaterial,
  type Texture,
} from 'three';
import { trackY } from './geometry';
import type { SceneLine, SceneModel, XY } from './model';
import { lamp, type Palette } from './tokens';

const carLength = 0.44;
const carGap = 0.06;
/** Scene units a second. */
const speed = 2.2;
/** Seconds a train waits at the end, then fades out; it fades in again at the start of its line. */
const dwell = 2.6;
const fadeOut = 0.8;
const fadeIn = 0.6;
/** First arrival at the end: the train nearest the platform during the opening shot, the others after it. */
const firstArrival = 3.2;
const arrivalStep = 4.4;

type Shapes = {
  shell: CapsuleGeometry;
  windows: BoxGeometry;
  stripe: BoxGeometry;
  lamp: SphereGeometry;
  beam: PlaneGeometry;
  under: PlaneGeometry;
};

type Paints = {
  shell: Material;
  windows: Material;
  stripe: Material;
  lamp: Material;
  head: SpriteMaterial;
  beam: Material;
  under: Material;
};

type Train = { cars: Group[]; path: CurvePath<Vector3>; length: number; phase: number; materials: Material[] };

export type Trains = { group: Group; update: (time: number) => void };

/**
 * A car: rounded metal shell, a band of lit windows, a stripe in the line colour, its light on the ground; the front
 * car also has two headlamps with a small glow and a faint beam ahead on the ground.
 */
function car(shapes: Shapes, paints: Paints, front: boolean): Group {
  const group = new Group();
  const shell = new Mesh(shapes.shell, paints.shell);
  shell.rotation.x = Math.PI / 2;
  shell.scale.set(1.05, 1, 0.85);
  shell.position.y = 0.13;
  const windows = new Mesh(shapes.windows, paints.windows);
  windows.position.y = 0.155;
  const stripe = new Mesh(shapes.stripe, paints.stripe);
  stripe.position.y = 0.095;
  const under = new Mesh(shapes.under, paints.under);
  under.rotation.x = -Math.PI / 2;
  under.position.y = 0.02;
  group.add(shell, windows, stripe, under);
  if (!front) return group;
  [-0.05, 0.05].forEach((x) => {
    const headlamp = new Mesh(shapes.lamp, paints.lamp);
    headlamp.position.set(x, 0.1, carLength / 2 + 0.005);
    group.add(headlamp);
  });
  const head = new Sprite(paints.head);
  head.scale.set(0.38, 0.38, 1);
  head.position.set(0, 0.11, carLength / 2 + 0.04);
  const beam = new Mesh(shapes.beam, paints.beam);
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.03, carLength / 2 + 0.7);
  group.add(head, beam);
  return group;
}

function distance([x, y]: XY, [ex, ey]: XY): number {
  return Math.hypot(x - ex, y - ey);
}

/**
 * One train of three cars a line, running from the start of its line to the shared end, braking into it, waiting,
 * fading out and starting again. The lines run out of step: the one that ends nearest the middle of the end bars
 * comes in during the opening shot.
 */
export function buildTrains(
  model: SceneModel,
  paths: Map<number, CurvePath<Vector3>>,
  palette: Palette,
  glow: Texture,
): Trains {
  const group = new Group();
  const shapes: Shapes = {
    shell: new CapsuleGeometry(0.1, carLength - 0.2, 6, 16),
    windows: new BoxGeometry(0.212, 0.045, carLength - 0.16),
    stripe: new BoxGeometry(0.214, 0.022, carLength - 0.1),
    lamp: new SphereGeometry(0.018, 10, 8),
    beam: new PlaneGeometry(0.55, 1.5),
    under: new PlaneGeometry(0.6, carLength + 0.3),
  };
  const last = (line: SceneLine) => line.track[line.track.length - 1];
  const order = [...model.lines].sort(
    (a, b) => distance(last(a), model.end.xy) - distance(last(b), model.end.xy) || a.number - b.number,
  );

  const trains = order.flatMap((line, index): Train[] => {
    const path = paths.get(line.number);
    if (!path) return [];
    const paints: Paints = {
      shell: palette.standard(['--text', '--muted'], { roughness: 0.28, metalness: 0.45, transparent: true }),
      windows: palette.standard(lamp.window, { emissive: 2.2, transparent: true }),
      stripe: palette.standard(line.token, { emissive: 2.6, transparent: true }),
      lamp: palette.standard('--packet', { emissive: 4, transparent: true }),
      head: palette.sprite(lamp.warm, 0.6, glow),
      beam: palette.halo(lamp.warm, 0.12, glow),
      under: palette.halo(line.token, 0.18, glow),
    };
    const cars = [0, 1, 2].map((position) => car(shapes, paints, position === 0));
    group.add(...cars);
    const length = path.getLength();
    const arrival = firstArrival + arrivalStep * index;
    return [{ cars, path, length, phase: length / speed - arrival, materials: Object.values(paints) }];
  });

  const point = new Vector3();
  const tangent = new Vector3();

  const place = (train: Train, time: number) => {
    const travel = train.length / speed;
    const cycle = travel + dwell + fadeOut;
    const local = (((time + train.phase) % cycle) + cycle) % cycle;
    let u = 1;
    if (local < travel) {
      const x = local / travel;
      // Constant speed, then a steady brake over the last fifth of the run into the end.
      u = Math.min(1, x < 0.8 ? x / 0.9 : (0.8 + (x - 0.8) - (x - 0.8) ** 2 / 0.4) / 0.9);
    }
    const fade = local > travel + dwell ? 1 - (local - travel - dwell) / fadeOut : Math.min(1, local / fadeIn);
    train.materials.forEach((material) => {
      material.opacity = palette.opacity(material) * fade;
    });
    train.cars.forEach((group, position) => {
      const at = MathUtils.clamp(u - (position * (carLength + carGap)) / train.length, 0, 1);
      train.path.getPointAt(at, point);
      train.path.getTangentAt(Math.min(at, 0.9999), tangent);
      group.position.set(point.x, trackY - 0.05, point.z);
      group.rotation.y = Math.atan2(tangent.x, tangent.z);
      group.visible = fade > 0.02;
    });
  };

  return { group, update: (time) => trains.forEach((train) => place(train, time)) };
}
