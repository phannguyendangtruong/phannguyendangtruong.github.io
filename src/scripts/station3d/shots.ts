import { Vector3 } from 'three';
import { distanceAlong, type ToWorld } from './geometry';
import { deckY, type Metro } from './metro';
import type { SceneLine, SceneModel, SceneStation } from './model';

/**
 * A shot: where the camera stands, the point it looks at, and where that point is drawn in the window when no
 * platform panel stands beside the shot: `frame` across (a share of the width from the left), `frameY` down (a share
 * of the height from the top).
 */
export type Shot = { pos: Vector3; look: Vector3; frame: number; frameY: number };

/** Shots by the key an element of the page names in its data-cam attribute, the opening shot and the lite shot. */
export type Shots = { intro: Shot; lite: Shot; byKey: Map<string, Shot> };

/** Half way up from the ring of a portal (0.4 over its deck) to its hologram (2.6 over it), magic.ts. */
const portalRise = 1.5;

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

function shot(look: Vector3, from: Vector3, frame = 0.5, frameY = 0.5): Shot {
  return { look, pos: look.clone().add(from), frame, frameY };
}

function centre(points: Vector3[]): Vector3 {
  return points.reduce((sum, point) => sum.add(point), new Vector3()).divideScalar(Math.max(1, points.length));
}

/** Middle of the box round every track of the network, on the ground. */
function middleOf(model: SceneModel, at: ToWorld): Vector3 {
  const all = model.lines.flatMap((line) => line.track.map((xy) => at(xy)));
  const xs = all.map((point) => point.x);
  const zs = all.map((point) => point.z);
  return v((Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2);
}

/** Side the camera of a line comes from: the side its station labels are written on, else away from the middle. */
function sideOf(stations: SceneStation[], x: number, middle: number): number {
  const side = stations[0]?.side;
  if (side === 'end') return -1;
  if (side === 'start') return 1;
  return x < middle ? -1 : 1;
}

/** Height of the deck of a line at its point nearest to `point`. */
function deckAt(metro: Metro, number: number, point: Vector3): number {
  const path = metro.paths.get(number);
  if (!path) return deckY;
  return path.getPointAt(distanceAlong(path, point) / path.getLength()).y;
}

/**
 * Over the stations of a line: their middle on the ground, the height of the deck there, and the side the camera
 * comes from (-1 or 1 along x).
 */
function overLine(model: SceneModel, at: ToWorld, metro: Metro, line: SceneLine, middleX: number) {
  const stations = model.stations.filter((station) => station.line === line.number);
  const points = stations.length > 0 ? stations.map((station) => at(station.xy)) : [at(line.track[0])];
  const look = centre(points);
  const deck = deckAt(metro, line.number, look);
  return { look, deck, side: sideOf(stations, look.x, middleX) };
}

/** The portal where the path of a line starts, on its deck; `into` units along the line from it when given. */
function portalOf(metro: Metro, at: ToWorld, line: SceneLine, into = 0): Vector3 {
  const path = metro.paths.get(line.number);
  return path ? path.getPointAt(Math.min(1, into / path.getLength())) : at(line.track[0], deckY);
}

/**
 * Shots of the drone, all from the data: 'overview' high over the whole city, its look point drawn right of the middle
 * beside the name block of the hero; 'start' on the portal where the current line starts and the hologram over it;
 * 'line-<n>' over the stations of a line from the side its labels are written on, higher over a deck that rides over
 * another line; 'hubs' down the trunk and its bridge over the river from high in the north-east; 'end' over the vault
 * of the end. The opening shot comes down from above the clouds; the lite shot looks at the trunk, the bridge and the
 * end from high in the south-east.
 */
export function buildShots(model: SceneModel, at: ToWorld, metro: Metro): Shots {
  const byKey = new Map<string, Shot>();
  const middle = middleOf(model, at);
  const overview = shot(middle.clone().add(v(8.8, 0, 3.1)), v(-2, 40, 50), 0.63);
  byKey.set('overview', overview);

  model.lines.forEach((line) => {
    const { look, deck, side } = overLine(model, at, metro, line, middle.x);
    look.y = deck - 0.4;
    byKey.set(`line-${line.number}`, shot(look, v(side * 9, 10 + (deck - deckY) * 4, 12)));
    if (line.number === model.current) {
      // The portal itself, where the path of the line starts, raised half way to the hologram so the shot holds both
      // and the first stretch of the viaduct; from far enough back that the whole hologram stays in the room the
      // About panel leaves on its right, at 1440 by 900 too.
      const portal = portalOf(metro, at, line);
      portal.y += portalRise;
      byKey.set('start', shot(portal, v(10, 9.4, 16.3)));
    }
  });

  const end = at(model.end.xy);
  byKey.set('hubs', shot(end.clone().add(v(0, 1.4, -9)), v(12, 19, -11)));
  byKey.set('end', shot(end.clone().add(v(0, 2.6, -2.6)), v(11, 7, 13)));
  const intro = shot(middle.clone().add(v(6.8, 0, -2.9)), v(-26, 92, 68));
  const lite = shot(end.clone().add(v(-1.5, 1.2, -7)), v(15, 25, 21));
  return { intro, lite, byKey };
}

/**
 * Shots for a window held upright (a phone): the network mostly runs north to south, so every shot looks north along
 * it from the south and high, its look point in the middle of the window, between two cards of the page. 'overview'
 * looks up the trunk past the end, its look point low in the window (70% of the height) under the name block of the
 * hero; 'start' the portal of the current line and the whole hologram over it; 'line-<n>' the stations of a line, a
 * little to the side its labels are written on; 'hubs' the trunk from far behind the end; 'end' the vault close up.
 * The opening shot comes down onto the overview from above the clouds.
 */
export function buildTallShots(model: SceneModel, at: ToWorld, metro: Metro): Shots {
  const byKey = new Map<string, Shot>();
  const middle = middleOf(model, at);
  const end = at(model.end.xy);
  const overview = end.clone().add(v(-4, 0, -16));
  byKey.set('overview', shot(overview, v(0, 44, 44), 0.5, 0.7));

  model.lines.forEach((line) => {
    const { look, deck, side } = overLine(model, at, metro, line, middle.x);
    look.y = deck - 0.2;
    byKey.set(`line-${line.number}`, shot(look, v(side * 3.5, 10 + (deck - deckY) * 1.5, 14)));
    if (line.number === model.current) {
      // The portal itself, 0.8 into the line from where it starts and raised half way to the hologram, so the portal
      // and the whole hologram sit in the middle of the open gap above the About card.
      const portal = portalOf(metro, at, line, 0.8);
      portal.y += portalRise;
      byKey.set('start', shot(portal, v(5, 7.5, 13)));
    }
  });

  const close = shot(end.clone().add(v(0, 3, -1.6)), v(6, 8, 14));
  byKey.set('hubs', shot(end.clone().add(v(0, 1.4, -8)), v(4, 17, 26)));
  byKey.set('end', close);
  const intro = shot(overview.clone(), v(-6, 95, 66));
  return { intro, lite: close, byKey };
}
