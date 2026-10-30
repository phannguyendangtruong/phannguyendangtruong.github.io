import { BoxGeometry, Color, Group, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three';
import type { Kit } from './assets';
import type { Top } from './buildings';
import { extent, grid, hash, riverWidth, type CityPlan } from './layout';
import { sparks } from './sparks';
import { smooth } from './wake';

/** Warm sodium and white LED street lamps, the warm lamps of the embankment, the red lights on the towers. */
const sodium = [1.0, 0.6, 0.28];
const led = [0.85, 0.92, 1.0];
const quay = [1.0, 0.72, 0.42];
const beacon = [1, 0.06, 0.03];

/** Colours of the LED crowns on top of some towers: warm white, cool white and a slightly dimmer neutral white, so no crown reads as a line colour; bright enough to bloom. */
const crownColors = [
  new Color(1.0, 0.88, 0.72),
  new Color(0.85, 0.92, 1.0),
  new Color(0.8, 0.8, 0.8),
];

/**
 * Lights of the streets and the skyline: a lamp head every 1.5 units on both pavements of every grid road (as the
 * pools of light on the ground), lamps along both embankments, a blinking red light on top of every tower, and an LED
 * crown along the top edge of some towers. Street lamps and crowns are night things; the red lights stay by day.
 * During the opening shot the lamps and red lights come on as the wave of the wake passes them, the crowns a little
 * before the middle of the wake (wake.ts).
 */
export function buildCityLights(tops: Top[], plan: CityPlan, kit: Kit): Group {
  const group = new Group();
  const lamps = { positions: [] as number[], colors: [] as number[], sizes: [] as number[] };
  const lamp = (x: number, y: number, z: number, color: number[], size: number) => {
    lamps.positions.push(x, y, z);
    lamps.colors.push(...color);
    lamps.sizes.push(size);
  };
  const pitch = grid.pitch;
  for (let k = Math.floor(-extent.x / pitch); k <= extent.x / pitch; k += 1) {
    for (let j = Math.floor(-extent.z / pitch); j <= extent.z / pitch; j += 1) {
      // Lamps of the road along z at x = k·pitch, and of the road along x at z = j·pitch, in the stretch of this block.
      for (let n = 0; n < 4; n += 1) {
        const along = (n + 0.5) * 1.5;
        if (along < grid.walk + 0.1 || along > pitch - grid.walk - 0.1) continue;
        [-0.7, 0.7].forEach((offset) => {
          [
            [k * pitch + offset, j * pitch + along, k * 5 + j],
            [k * pitch + along, j * pitch + offset, k + j * 5],
          ].forEach(([x, z, stretch]) => {
            if (plan.riverDistance(x, z) < riverWidth.half + 0.3 || plan.trackDistance(x, z) < 0.6) return;
            const road = Math.abs(Math.round(x / pitch)) * 5 + Math.abs(Math.round(z / pitch));
            lamp(x, 0.34, z, hash(road, stretch) < 0.45 ? led : sodium, 0.16);
          });
        });
      }
    }
  }
  plan.river.slice(1).forEach(([bx, bz], index) => {
    const [ax, az] = plan.river[index];
    const length = Math.hypot(bx - ax, bz - az);
    const [nx, nz] = [-(bz - az) / length, (bx - ax) / length];
    for (let s = 0.5; s < length; s += 1.1) {
      [-1, 1].forEach((side) => {
        const x = ax + ((bx - ax) * s) / length + nx * side * (riverWidth.half + 0.25);
        const z = az + ((bz - az) * s) / length + nz * side * (riverWidth.half + 0.25);
        if (plan.trackDistance(x, z) < 0.8 || plan.riverDistance(x, z) < riverWidth.half + 0.1) return;
        lamp(x, 0.3, z, quay, 0.13);
      });
    }
  });
  const streets = sparks(kit, {
    positions: Float32Array.from(lamps.positions),
    colors: Float32Array.from(lamps.colors),
    sizes: Float32Array.from(lamps.sizes),
    intensity: 2.6,
    wake: true,
  });

  const towers = tops.filter((top) => top.tower);
  const beacons = sparks(kit, {
    positions: Float32Array.from(towers.flatMap((top) => [top.x, top.top + 0.12, top.z])),
    colors: Float32Array.from(towers.flatMap(() => beacon)),
    sizes: new Float32Array(towers.length).fill(0.32),
    blink: Float32Array.from(towers.map((top) => hash(top.x, top.z, 1))),
    intensity: 5,
    wake: true,
  });

  const crowned = towers.filter((top) => hash(top.seed, 9) < 0.4);
  const crownLight = new MeshBasicMaterial({ color: 0xffffff });
  const crowns = new InstancedMesh(new BoxGeometry(1, 1, 1), crownLight, crowned.length * 4);
  const matrix = new Matrix4();
  const color = new Color();
  let index = 0;
  crowned.forEach((top) => {
    color.copy(crownColors[Math.floor(hash(top.seed, 11) * crownColors.length)]).multiplyScalar(3);
    const y = top.top - 0.04;
    [
      [0, top.d / 2, top.w + 0.02, 0.025],
      [0, -top.d / 2, top.w + 0.02, 0.025],
      [top.w / 2, 0, 0.025, top.d + 0.02],
      [-top.w / 2, 0, 0.025, top.d + 0.02],
    ].forEach(([dx, dz, sx, sz]) => {
      crowns.setMatrixAt(index, matrix.makeScale(sx, 0.05, sz).setPosition(top.x + dx, y, top.z + dz));
      crowns.setColorAt(index, color);
      index += 1;
    });
  });
  kit.wake.on((progress) => crownLight.color.setScalar(smooth(0.4, 0.7, progress)));
  kit.theme.on((day) => {
    streets.visible = !day;
    crowns.visible = !day;
  });
  group.add(streets, beacons, crowns);
  return group;
}
