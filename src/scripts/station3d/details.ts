import {
  BoxGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
} from 'three';
import type { Kit } from './assets';
import type { Top } from './buildings';
import { extent, grid, hash, riverWidth, type CityPlan } from './layout';

/** x, y, z and size of a box or a tree crown. */
type Item = [number, number, number, number, number, number];

/** One instanced mesh of `shape` for every item. */
function instanced(shape: BufferGeometry, material: MeshStandardMaterial, items: Item[]): InstancedMesh {
  const mesh = new InstancedMesh(shape, material, items.length);
  const matrix = new Matrix4();
  const turn = new Quaternion();
  const position = new Vector3();
  const scale = new Vector3();
  items.forEach(([x, y, z, w, h, d], index) => {
    mesh.setMatrixAt(index, matrix.compose(position.set(x, y, z), turn, scale.set(w, h, d)));
  });
  return mesh;
}

/**
 * Small things that make the model read as real at close range: plant and water tanks on the roofs, a parapet rim
 * round each roof, and trees along the pavements and in the parks. Darker by night, light by day.
 */
export function buildDetails(tops: Top[], plan: CityPlan, kit: Kit): Group {
  const units: Item[] = [];
  const rims: Item[] = [];
  tops.forEach((top, i) => {
    const count = 2 + Math.floor(hash(top.seed, i, 1) * 4);
    for (let k = 0; k < count; k += 1) {
      const w = 0.08 + hash(i, k, 2) * 0.28;
      const d = 0.08 + hash(i, k, 3) * 0.22;
      const h = 0.05 + hash(i, k, 4) * 0.16;
      const x = top.x + (hash(i, k, 5) - 0.5) * Math.max(0, top.w - w - 0.12);
      const z = top.z + (hash(i, k, 6) - 0.5) * Math.max(0, top.d - d - 0.12);
      units.push([x, top.top + h / 2, z, w, h, d]);
    }
    const y = top.top + 0.03;
    rims.push(
      [top.x, y, top.z + top.d / 2, top.w, 0.06, 0.03],
      [top.x, y, top.z - top.d / 2, top.w, 0.06, 0.03],
      [top.x + top.w / 2, y, top.z, 0.03, 0.06, top.d],
      [top.x - top.w / 2, y, top.z, 0.03, 0.06, top.d],
    );
  });

  // Trees: on both pavements of the grid roads, between the lamps, and scattered in the parks.
  const trees: Item[] = [];
  const tree = (x: number, z: number, size: number) => trees.push([x, size * 1.6, z, size, size * 1.1, size]);
  const pitch = grid.pitch;
  for (let k = Math.floor(-extent.x / pitch); k <= extent.x / pitch; k += 1) {
    for (let j = Math.floor(-extent.z / pitch); j <= extent.z / pitch; j += 1) {
      [1.5, 3.0, 4.5].forEach((along) => {
        [-0.72, 0.72].forEach((offset) => {
          [
            [k * pitch + offset, j * pitch + along],
            [k * pitch + along, j * pitch + offset],
          ].forEach(([x, z]) => {
            if (hash(x, z, 8) < 0.35) return;
            if (plan.riverDistance(x, z) < riverWidth.half + 0.4 || plan.trackDistance(x, z) < 1.2) return;
            tree(x, z, 0.16 + hash(x, z, 9) * 0.1);
          });
        });
      });
      if (!plan.isPark(k, j)) continue;
      for (let n = 0; n < 26; n += 1) {
        const x = k * pitch + grid.walk + hash(k, j, n) * (pitch - grid.walk * 2);
        const z = j * pitch + grid.walk + hash(j, k, n + 40) * (pitch - grid.walk * 2);
        tree(x, z, 0.2 + hash(n, k, j) * 0.18);
      }
    }
  }

  const unitPaint = new MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.55, metalness: 0.5, envMapIntensity: 0.4 });
  const rimPaint = new MeshStandardMaterial({ color: 0x55575c, roughness: 0.8 });
  const leaves = new MeshStandardMaterial({ color: 0x1d2a1c, roughness: 0.95, flatShading: true });
  kit.theme.on((day) => {
    unitPaint.color.set(day ? 0xa7a9ad : 0x3a3c40);
    rimPaint.color.set(day ? 0xe4e3df : 0x55575c);
    leaves.color.set(day ? 0x5d7d47 : 0x1d2a1c);
  });
  const box = new BoxGeometry(1, 1, 1);
  const group = new Group();
  group.add(
    instanced(box, unitPaint, units),
    instanced(box, rimPaint, rims),
    instanced(new IcosahedronGeometry(1, 1), leaves, trees),
  );
  return group;
}
