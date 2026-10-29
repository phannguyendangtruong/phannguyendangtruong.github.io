import { BoxGeometry, Group, Mesh, PlaneGeometry, Vector3, type Texture } from 'three';
import { lamp, type Palette } from './tokens';

export type Station = {
  group: Group;
  /** Where the "You are here" label hangs from: in front of the platform end, clear of its lit edge. */
  here: Vector3;
};

/** Place of the station from the shared end, in scene units: beside the trunk, along its last stretch. */
const offset = new Vector3(1.15, 0, -1.3);

/**
 * The station at the shared end: a low platform with a lit safety line along its edge, a thin floating roof with
 * strips of light set through it, two slim masts at the back, and a pool of warm light on the platform.
 */
export function buildStation(end: Vector3, palette: Palette, glow: Texture): Station {
  const group = new Group();
  const concrete = palette.standard('--surface-2', { roughness: 0.85 });
  const metal = palette.standard('--surface-2', { roughness: 0.35, metalness: 0.6 });
  const light = palette.standard(lamp.warm, { emissive: 1.6 });

  const platform = new Mesh(new BoxGeometry(1.5, 0.3, 3.4), concrete);
  platform.position.set(0, 0.15, 0);
  const edge = new Mesh(new BoxGeometry(0.06, 0.02, 3.4), palette.standard(lamp.warm, { emissive: 0.9 }));
  edge.position.set(-0.7, 0.31, 0);
  const roof = new Mesh(new BoxGeometry(1.7, 0.035, 3.3), metal);
  roof.position.set(0.05, 1.15, 0);
  group.add(platform, edge, roof);

  // A little thicker than the roof, so the strips show from under it and from a camera above it.
  const strip = new BoxGeometry(1.5, 0.045, 0.05);
  [-1.2, -0.4, 0.4, 1.2].forEach((z) => {
    const mesh = new Mesh(strip, light);
    mesh.position.set(0.05, 1.15, z);
    group.add(mesh);
  });

  const mast = new BoxGeometry(0.03, 0.85, 0.03);
  const steel = palette.standard('--border-strong', { roughness: 0.4, metalness: 0.6 });
  [-1.45, 1.45].forEach((z) => {
    const mesh = new Mesh(mast, steel);
    mesh.position.set(0.82, 0.72, z);
    group.add(mesh);
  });

  const pool = new Mesh(new PlaneGeometry(3.2, 4.4), palette.halo(lamp.warm, 0.06, glow));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(-0.2, 0.32, 0);
  group.add(pool);

  group.position.copy(end).add(offset);
  return { group, here: new Vector3(end.x + offset.x, 0.45, end.z + 0.85) };
}
