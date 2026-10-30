import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three';
import type { Kit } from './assets';
import { distanceAlong, frameAt, unit, type ToWorld } from './geometry';
import { deckY, type Metro } from './metro';
import type { SceneModel, Side } from './model';
import { glazingTexture } from './textures';

/** Where a label hangs in the scene, and which point of the label sits there (as CSS2DObject.center). */
export type Anchor = { position: Vector3; centre: [number, number] };

/** Label points of the stations and the interchanges (in the order of the model), of "Now" and of "You are here". */
export type Anchors = { stations: Anchor[]; interchanges: Anchor[]; now: Anchor; here: Anchor };

export type Stations = { group: Group; anchors: Anchors };

/** Warm white of the station lights, amber of the platform edges, cold white of the interchange gates. */
const warm = new Color(1.0, 0.82, 0.6);
const amber = new Color(1, 0.75, 0.2);
const cold = new Color(0.75, 0.9, 1.0);

/** The concourse of the end stands this far up the trunk from the end point, over the ends of the lines. */
export const terminusBack = 1.6;

/** A station label hangs this far over the deck of its station (the canopy is at 0.665). */
export const stationLift = 0.95;

/** A label on the side its map label is written on: right of its point, left of it, or above it. */
function anchor(position: Vector3, side: Side): Anchor {
  if (side === 'start') return { position, centre: [0, 0.5] };
  if (side === 'end') return { position, centre: [1, 0.5] };
  return { position, centre: [0.5, 1] };
}

function box(width: number, height: number, depth: number, material: Material, x: number, y: number, z: number): Mesh {
  const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/**
 * A light by night, coming on a little after the middle of the wake (wake.ts); by day the same part painted
 * `dayColor`, unlit.
 */
function lamp(kit: Kit, color: Color, intensity: number, dayColor: Color | number = 0xe6e4df): MeshStandardMaterial {
  const material = kit.wake.lamp(
    new MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity }),
    0.45,
    0.7,
  );
  kit.theme.on((day) => {
    material.color.set(day ? dayColor : 0x000000);
    material.emissive.copy(color);
    kit.wake.setBase(material, day ? 0 : intensity);
  });
  return material;
}

/** Soft pool of light lying on a surface, by night only. */
function pool(kit: Kit, color: Color, width: number, depth: number, opacity: number): Mesh {
  const material = new MeshBasicMaterial({
    map: kit.assets.glow,
    color,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new Mesh(new PlaneGeometry(width, depth), material);
  mesh.rotation.x = -Math.PI / 2;
  kit.theme.on((day) => {
    mesh.visible = !day;
  });
  return mesh;
}

/**
 * The stations, on the decks of metro.ts: a project station is two side platforms with amber edges and glass screens
 * under a floating canopy with strips of light, the canopy painted in the line colour by day; an interchange a gate of
 * light across its parallel tracks; a hub a wide canopy over all of them; a crossing a round tower with a ring of
 * light; the end a glass vault on a lit concourse. Gives the label point of each.
 */
export function buildStations(model: SceneModel, at: ToWorld, metro: Metro, kit: Kit): Stations {
  const group = new Group();
  const roof = new MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.35, metalness: 0.8 });
  const slab = new MeshStandardMaterial({
    map: kit.assets.pavement,
    color: 0x5a5854,
    roughness: 0.6,
    envMapIntensity: 0.25,
  });
  kit.theme.on((day) => {
    roof.color.set(day ? 0xdcdee2 : 0x1c1e22);
    slab.color.set(day ? 0xc9c5bd : 0x5a5854);
  });
  const glassy = new MeshStandardMaterial({
    color: 0x9ec9ff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0.2,
    depthWrite: false,
    side: DoubleSide,
  });
  const strip = lamp(kit, warm, 2.2);
  const edge = lamp(kit, amber, 1.6, 0xe2b400);
  const gateLight = lamp(kit, cold, 3.5);
  const lift = new Vector3(0, stationLift, 0);

  const stations = model.stations.map((station): Anchor => {
    const path = metro.paths.get(station.line);
    const point = at(station.xy, deckY);
    if (!path) return anchor(point.add(lift), station.side);
    const color = kit.colors.of(station.line);
    const stop = new Group();
    [-1, 1].forEach((side) => {
      stop.add(box(0.32, 0.07, 2.6, slab, side * 0.69, 0.035, 0));
      stop.add(box(0.012, 0.12, 2.6, edge, side * 0.535, 0.075, 0));
      stop.add(box(0.02, 0.5, 2.6, glassy, side * 0.85, 0.3, 0));
      [-1.1, 0, 1.1].forEach((z) => stop.add(box(0.035, 0.58, 0.035, roof, side * 0.83, 0.33, z)));
    });
    stop.add(box(1.86, 0.035, 2.5, roof, 0, 0.64, 0));
    stop.add(box(1.86, 0.02, 2.5, lamp(kit, color, 0, color), 0, 0.665, 0));
    [-0.69, 0.69].forEach((x) => stop.add(box(0.05, 0.025, 2.3, strip, x, 0.615, 0)));
    const halo = pool(kit, warm, 2.4, 3.4, 0.14);
    halo.position.y = 0.08;
    stop.add(halo);
    const frame = frameAt(path, distanceAlong(path, point) / path.getLength());
    stop.position.copy(frame.point);
    stop.rotation.y = Math.atan2(frame.tangent.x, frame.tangent.z);
    group.add(stop);
    return anchor(frame.point.clone().add(lift), station.side);
  });

  // Distance between parallel tracks, in scene units: a gate or a hub canopy spans them and the decks either side.
  const pitch = model.gap * unit;
  const interchanges = model.interchanges.map((item): Anchor => {
    const { x, z } = at(item.xy);
    if (item.crossing) {
      const tower = new Mesh(new CylinderGeometry(0.42, 0.42, 2.9, 32), roof);
      tower.position.set(x, 1.0, z);
      const ring = new Mesh(new TorusGeometry(0.45, 0.025, 8, 48), gateLight);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 2.5, z);
      group.add(tower, ring);
      return anchor(new Vector3(x, 3.1, z), 'start');
    }
    const span = (item.tracks - 1) * pitch + 1.3;
    if (item.hub) {
      const hub = new Group();
      hub.add(box(span, 0.04, 2.4, roof, 0, deckY + 0.72, 0));
      for (let k = 0; k < item.tracks; k += 1) {
        hub.add(box(0.05, 0.025, 2.2, strip, (k - (item.tracks - 1) / 2) * pitch + pitch / 2, deckY + 0.69, 0));
      }
      for (let k = 1; k < item.tracks; k += 1) {
        hub.add(box(0.2, 0.06, 2.4, slab, (k - item.tracks / 2) * pitch, deckY + 0.03, 0));
      }
      [-1, 1].forEach((sx) => {
        [-1.1, 1.1].forEach((dz) => hub.add(box(0.05, 0.75, 0.05, roof, sx * (span / 2 - 0.1), deckY + 0.35, dz)));
      });
      const halo = pool(kit, warm, span + 0.9, 3.6, 0.12);
      halo.position.y = deckY + 0.07;
      hub.add(halo);
      hub.position.set(x, 0, z);
      group.add(hub);
      return anchor(new Vector3(x + span / 2 + 0.35, deckY + 0.9, z), 'start');
    }
    // A gate of light across the parallel tracks, its label on the side the map writes it.
    const gate = new Group();
    gate.add(box(span, 0.035, 0.035, gateLight, 0, deckY + 0.85, 0));
    [-span / 2, span / 2].forEach((dx) => gate.add(box(0.035, 0.85, 0.035, gateLight, dx, deckY + 0.425, 0)));
    gate.position.set(x, 0, z);
    group.add(gate);
    const side = item.side === 'end' ? -1 : 1;
    return anchor(new Vector3(x + side * (span / 2 + 0.25), deckY + 0.7, z), side < 0 ? 'end' : 'start');
  });

  const end = at(model.end.xy);
  group.add(buildTerminus(kit, end, roof, slab));
  const now = anchor(new Vector3(end.x, 4.6, end.z - terminusBack), 'middle');
  const here = anchor(new Vector3(end.x + 2.6, 0.6, end.z + 1.6), 'start');
  return { group, anchors: { stations, interchanges, now, here } };
}

/**
 * The end: a glass barrel vault with lit ribs over the ends of the lines, on a concourse lit from inside, its glass
 * front the first light of the wake (wake.ts).
 */
function buildTerminus(kit: Kit, end: Vector3, roof: Material, slab: Material): Group {
  const terminus = new Group();
  const length = 5.2;
  const glass = new MeshStandardMaterial({
    color: 0x9fc4e8,
    emissive: new Color(0.35, 0.45, 0.6),
    emissiveIntensity: 0.06,
    transparent: true,
    opacity: 0.16,
    roughness: 0.05,
    metalness: 0.4,
    side: DoubleSide,
    depthWrite: false,
  });
  // The half of the cylinder that faces local +z: turned so that it arches up, flattened as the ribs are.
  const vault = new Mesh(new CylinderGeometry(2.3, 2.3, length, 40, 1, true, -Math.PI / 2, Math.PI), glass);
  vault.rotation.x = -Math.PI / 2;
  vault.scale.set(1, 1, 0.55);
  vault.position.set(0, 1.75, 0);
  terminus.add(vault);
  const rib = new TorusGeometry(2.3, 0.02, 6, 40, Math.PI);
  const litRib = lamp(kit, warm, 1.2);
  for (let index = 0; index <= 8; index += 1) {
    const mesh = new Mesh(rib, index % 2 ? litRib : roof);
    mesh.scale.set(1, 0.55, 1);
    mesh.position.set(0, 1.75, -length / 2 + (index * length) / 8);
    terminus.add(mesh);
  }
  terminus.add(box(4.8, 0.08, length, slab, 0, 1.56, 0));
  // Concourse under the platforms: a dark frame, its glass front lit from inside.
  terminus.add(box(4.6, 1.5, length - 0.4, roof, 0, 0.75, 0));
  const front = kit.own(glazingTexture());
  front.repeat.set(3, 1);
  const glazing = kit.wake.lamp(
    new MeshStandardMaterial({
      color: 0x050608,
      emissive: 0xffffff,
      emissiveMap: front,
      emissiveIntensity: 0.9,
      roughness: 0.12,
      metalness: 0.5,
    }),
    0.1,
    0.3,
  );
  terminus.add(box(4.64, 0.9, length - 0.8, glazing, 0, 0.62, 0));
  const rim = lamp(kit, amber, 2);
  [-1, 1].forEach((side) => terminus.add(box(0.06, 0.08, length, rim, side * 2.38, 1.62, 0)));
  const halo = pool(kit, new Color(1.0, 0.7, 0.45), 14, 14, 0.1);
  halo.position.y = 0.03;
  terminus.add(halo);
  kit.theme.on((day) => {
    glass.emissiveIntensity = day ? 0 : 0.06;
    glass.opacity = day ? 0.3 : 0.16;
    kit.wake.setBase(glazing, day ? 0.12 : 0.9);
    glazing.color.set(day ? 0x2c3a48 : 0x050608);
  });
  terminus.position.set(end.x, 0, end.z - terminusBack);
  return terminus;
}
