import {
  AdditiveBlending,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PlaneGeometry,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Camera,
  type IUniform,
  type Points,
  type ShaderMaterial,
} from 'three';
import type { Kit } from './assets';
import { frameAt, type ToWorld } from './geometry';
import { beamShader, coneShader, glowing, holoShader, holoVertex, veilShader } from './magic-shaders';
import type { Metro } from './metro';
import type { SceneModel } from './model';
import { sparks } from './sparks';
import { terminusBack } from './station';
import { hologramTexture, type SignFonts } from './textures';
import { smooth } from './wake';

const white = new Color(1, 1, 1);

/** Light of the sparks of a stream, before the pointer brightens or dims its line. */
const flowLight = 3.2;

/** Sparks running along a line towards the end, each a share of the way along points sampled on its path. */
type Flow = {
  line: number;
  points: Points<BufferGeometry, ShaderMaterial>;
  positions: Float32Array;
  colors: Float32Array;
  samples: Vector3[];
  offsets: number[];
  speed: number;
};

/**
 * The portal and hologram at the start of a line: its distance from the end (the wake reaches it then), the uniforms
 * that bring the hologram and the swirl in, the ring and the cone of light.
 */
type Portal = {
  line: number;
  holo: Mesh;
  base: number;
  distance: number;
  opacity: IUniform<number>;
  emphasis: IUniform<number>;
  on: IUniform<number>;
  ring: Mesh;
  cone: Mesh;
};

/** Hologram of a line, which the pointer can pick (interact.ts). */
export type Hologram = { line: number; mesh: Mesh };

export type Magic = {
  group: Group;
  update: (time: number, camera: Camera) => void;
  holos: Hologram[];
  /** Brightens (over 1) or dims (under 1) the stream and the hologram of a line. */
  emphasize: (line: number, value: number) => void;
};

/**
 * The magic over the city: at the start of each line a ring of light the trains come out of, with a hologram of the
 * company over it on a cone of light (text from the data, in the fonts of the page); streams of light running along
 * each line towards the end; at the end a beam into the sky with rings of the line colours turning round it and
 * sparks rising. By day the holograms and sparks are drawn in the line colours rather than added as light, and the
 * beam, cones and swirls are off. During the wake (wake.ts) each portal comes on as the wave reaches it, the beam
 * shoots up from the vault once the wave has crossed the city, then the rings and the rising sparks appear.
 */
export function buildMagic(model: SceneModel, at: ToWorld, metro: Metro, kit: Kit, fonts: SignFonts): Magic {
  const group = new Group();
  const { uniforms } = kit;
  const portals: Portal[] = [];
  const flows: Flow[] = [];
  const ringShape = new TorusGeometry(0.62, 0.045, 12, 64);
  const veilShape = new CircleGeometry(0.6, 48);
  const holoShape = new PlaneGeometry(4.2, 1.05);
  const coneShape = new CylinderGeometry(2.0, 0.08, 1.6, 32, 1, true);
  const end = at(model.end.xy);

  model.lines.forEach((line) => {
    const path = metro.paths.get(line.number);
    if (!path) return;
    const color = kit.colors.of(line.number);
    const frame = frameAt(path, 0);
    const portal = new Group();
    const ring = new Mesh(ringShape, new MeshBasicMaterial());
    const on = { value: 1 };
    const veil = new Mesh(veilShape, glowing({ color: { value: color }, uTime: uniforms.uTime, uOn: on }, veilShader));
    portal.add(ring, veil);
    portal.position.copy(frame.point).add(new Vector3(0, 0.4, 0));
    portal.rotation.y = Math.atan2(frame.tangent.x, frame.tangent.z);
    group.add(portal);

    const holoColor = new Color();
    const opacity = { value: 1 };
    const emphasis = { value: 1 };
    const holoMaterial = glowing(
      {
        map: { value: kit.own(hologramTexture(line, fonts)) },
        color: { value: holoColor },
        uTime: uniforms.uTime,
        uOpacity: opacity,
        uEmphasis: emphasis,
        uDay: uniforms.uDay,
      },
      holoShader,
      holoVertex,
    );
    const holo = new Mesh(holoShape, holoMaterial);
    holo.position.copy(frame.point).add(new Vector3(0, 2.6, 0));
    const cone = new Mesh(coneShape, glowing({ color: { value: color } }, coneShader));
    cone.position.copy(frame.point).add(new Vector3(0, 1.45, 0));
    group.add(holo, cone);
    const distance = Math.hypot(frame.point.x - end.x, frame.point.z - end.z);
    portals.push({ line: line.number, holo, base: holo.position.y, distance, opacity, emphasis, on, ring, cone });

    // Stream of light: sparks running along the line towards the end, a little above the deck.
    const count = Math.round(path.getLength() * 3);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = Float32Array.from({ length: count }, () => 0.09 + 0.08 * Math.random());
    const points = sparks(kit, { positions, colors, sizes, intensity: flowLight, wake: true });
    group.add(points);
    flows.push({
      line: line.number,
      points,
      positions,
      colors,
      samples: path.getSpacedPoints(800),
      offsets: Array.from({ length: count }, () => Math.random()),
      speed: 0.045 + Math.random() * 0.01,
    });

    kit.theme.on((day) => {
      ring.material.color.copy(color).multiplyScalar(day ? 1 : 4);
      holoColor.copy(color).lerp(white, 0.25);
      holoMaterial.blending = day ? NormalBlending : AdditiveBlending;
      veil.visible = !day;
      for (let index = 0; index < colors.length; index += 3) color.toArray(colors, index);
      points.geometry.getAttribute('color').needsUpdate = true;
    });
  });

  // The end: a beam into the sky from the vault (it grows from its foot), a ring of each line colour turning round
  // it, sparks rising.
  const centre = new Vector3(end.x, 0, end.z - terminusBack);
  const beam = new Mesh(
    new CylinderGeometry(0.16, 0.16, 120, 24, 1, true).translate(0, 60, 0),
    glowing({ uTime: uniforms.uTime }, beamShader),
  );
  beam.position.copy(centre).setY(3.2);
  group.add(beam);
  const rings = model.lines.map((line, index) => {
    const ring = new Mesh(new TorusGeometry(1.3 + index * 0.4, 0.016, 8, 96), new MeshBasicMaterial());
    ring.position.copy(centre).setY(4.2 + index * 0.7);
    group.add(ring);
    return { ring, color: kit.colors.of(line.number) };
  });
  const riseCount = 140;
  const rising = new Float32Array(riseCount * 3);
  const sparksUp = sparks(kit, {
    positions: rising,
    colors: Float32Array.from({ length: riseCount * 3 }, (_, index) => [1, 0.85, 0.6][index % 3]),
    sizes: Float32Array.from({ length: riseCount }, () => 0.06 + Math.random() * 0.08),
    intensity: 3,
  });
  // Each rising spark: where it is in its climb, the angle it turns from and the radius it starts at.
  const seeds = Array.from({ length: riseCount }, () => [
    Math.random(),
    Math.random() * Math.PI * 2,
    0.2 + Math.random() * 1.6,
  ]);
  group.add(sparksUp);

  let isDay = false;
  const refresh = () => {
    portals.forEach(({ distance, opacity, on, ring, cone }) => {
      const shown = smooth(distance - 2, distance + 6, kit.wake.radius);
      opacity.value = shown;
      on.value = shown;
      ring.scale.setScalar(0.2 + 0.8 * shown);
      cone.visible = !isDay && shown > 0.02;
    });
    const shoot = smooth(0.72, 0.9, kit.wake.value);
    beam.scale.set(1, Math.max(0.001, shoot * shoot), 1);
    beam.visible = !isDay && shoot > 0.001;
    const after = smooth(0.85, 1, kit.wake.value);
    rings.forEach(({ ring }) => ring.scale.setScalar(Math.max(0.001, after)));
    sparksUp.visible = !isDay && after > 0.05;
  };
  kit.wake.on(refresh);
  kit.theme.on((day) => {
    isDay = day;
    rings.forEach(({ ring, color }) => ring.material.color.copy(color).multiplyScalar(day ? 1 : 2.6));
    refresh();
  });

  const emphasize = (line: number, value: number) => {
    flows.forEach((flow) => {
      if (flow.line === line) flow.points.material.uniforms.uIntensity.value = flowLight * value;
    });
    portals.forEach((portal) => {
      if (portal.line === line) portal.emphasis.value = value;
    });
  };

  const update = (time: number, camera: Camera) => {
    portals.forEach(({ holo, base }, index) => {
      holo.position.y = base + Math.sin(time * 0.9 + index) * 0.08;
      holo.rotation.y = Math.atan2(camera.position.x - holo.position.x, camera.position.z - holo.position.z);
    });
    flows.forEach((flow) => {
      const last = flow.samples.length - 1;
      flow.offsets.forEach((offset, index) => {
        const u = (offset + time * flow.speed) % 1;
        const f = u * last;
        const a = flow.samples[Math.floor(f)];
        const b = flow.samples[Math.min(last, Math.floor(f) + 1)];
        const k = f - Math.floor(f);
        flow.positions[index * 3] = a.x + (b.x - a.x) * k;
        flow.positions[index * 3 + 1] = a.y + 0.55 + Math.sin(u * 60 + index) * 0.06;
        flow.positions[index * 3 + 2] = a.z + (b.z - a.z) * k;
      });
      flow.points.geometry.getAttribute('position').needsUpdate = true;
    });
    rings.forEach(({ ring }, index) => {
      ring.rotation.x = Math.PI / 2 + Math.sin(time * 0.4 + index * 2) * 0.25;
      ring.rotation.y = time * (0.3 + index * 0.12) * (index % 2 ? -1 : 1);
    });
    seeds.forEach(([offset, angle, radius], index) => {
      const u = (offset + time * 0.08) % 1;
      rising[index * 3] = centre.x + Math.cos(angle + u * 4) * radius * (1 - u * 0.6);
      rising[index * 3 + 1] = 2.0 + u * 14;
      rising[index * 3 + 2] = centre.z + Math.sin(angle + u * 4) * radius * (1 - u * 0.6);
    });
    sparksUp.geometry.getAttribute('position').needsUpdate = true;
  };
  const holos = portals.map(({ line, holo }) => ({ line, mesh: holo }));
  return { group, update, holos, emphasize };
}
