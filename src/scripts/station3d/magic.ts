import {
  AdditiveBlending,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Camera,
  type IUniform,
  type Points,
} from 'three';
import type { Kit } from './assets';
import { frameAt, type ToWorld } from './geometry';
import type { Metro } from './metro';
import type { SceneModel } from './model';
import { sparks } from './sparks';
import { terminusBack } from './station';
import { hologramTexture, type SignFonts } from './textures';

const quad =
  'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/** Swirl of light inside the ring of a portal. */
const veilShader = `uniform vec3 color; uniform float uTime; varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    float swirl = 0.5 + 0.5 * sin(a * 5.0 + r * 9.0 - uTime * 3.0);
    float k = smoothstep(1.0, 0.2, r) * (0.25 + 0.75 * swirl) * (0.6 + 0.4 * r);
    gl_FragColor = vec4(color * k * 1.8, 1.0);
  }`;

/** Hologram: scan lines, a sweep, flicker and a rare glitch over the text; by day the text in the line colour. */
const holoVertex = `varying vec2 vUv; varying vec3 vWorld;
  void main() {
    vUv = uv; vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const holoShader = `uniform sampler2D map; uniform vec3 color; uniform float uTime; uniform float uOpacity; uniform float uDay;
  varying vec2 vUv; varying vec3 vWorld;
  void main() {
    float glitch = step(0.985, fract(sin(floor(uTime * 9.0) * 12.9898) * 43758.5)) * 0.012;
    vec2 uv = vUv + vec2(glitch * sin(vUv.y * 80.0), 0.0);
    float a = texture2D(map, uv).a;
    float scan = 0.72 + 0.28 * sin(vWorld.y * 140.0 - uTime * 6.0);
    float sweep = smoothstep(0.0, 0.08, fract(vUv.y * 0.5 - uTime * 0.35)) * 0.4 + 0.6;
    float flicker = 0.9 + 0.1 * sin(uTime * 37.0) * sin(uTime * 13.0);
    float edge = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
    vec3 glow = color * (a * 2.6 * scan * sweep * flicker + 0.05 * edge);
    gl_FragColor = uDay > 0.5 ? vec4(color * 0.72, min(1.0, a * 1.5) * uOpacity) : vec4(glow * uOpacity, 1.0);
  }`;

/** Cone of light under a hologram, fading upwards. */
const coneShader = `uniform vec3 color; varying vec2 vUv;
  void main() {
    float k = (0.25 + 0.75 * (1.0 - vUv.y)) * smoothstep(1.0, 0.85, vUv.y);
    gl_FragColor = vec4(color * k * 0.09, 1.0);
  }`;

/** Beam of the end into the sky, in moving bands, fading with height. */
const beamShader = `uniform float uTime; varying vec2 vUv;
  void main() {
    float fade = pow(1.0 - vUv.y, 2.2);
    float bands = 0.75 + 0.25 * sin(vUv.y * 160.0 - uTime * 5.0);
    gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * fade * bands * 0.9, 1.0);
  }`;

/** Light added to the scene, seen from both sides, never hiding what is behind it. */
function glowing(uniforms: Record<string, IUniform>, fragmentShader: string, vertexShader = quad): ShaderMaterial {
  return new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
}

const white = new Color(1, 1, 1);

/** Sparks running along a line towards the end, each a share of the way along points sampled on its path. */
type Flow = {
  points: Points<BufferGeometry, ShaderMaterial>;
  positions: Float32Array;
  colors: Float32Array;
  samples: Vector3[];
  offsets: number[];
  speed: number;
};

export type Magic = { group: Group; update: (time: number, camera: Camera) => void };

/**
 * The magic over the city: at the start of each line a ring of light the trains come out of, with a hologram of the
 * company over it on a cone of light (text from the data, in the fonts of the page); streams of light running along
 * each line towards the end; at the end a beam into the sky with rings of the line colours turning round it and
 * sparks rising. By day the holograms and sparks are drawn in the line colours rather than added as light, and the
 * beam, cones and swirls are off.
 */
export function buildMagic(model: SceneModel, at: ToWorld, metro: Metro, kit: Kit, fonts: SignFonts): Magic {
  const group = new Group();
  const { uniforms } = kit;
  const holos: { holo: Mesh; base: number }[] = [];
  const flows: Flow[] = [];
  const ringShape = new TorusGeometry(0.62, 0.045, 12, 64);
  const veilShape = new CircleGeometry(0.6, 48);
  const holoShape = new PlaneGeometry(4.2, 1.05);
  const coneShape = new CylinderGeometry(2.0, 0.08, 1.6, 32, 1, true);

  model.lines.forEach((line) => {
    const path = metro.paths.get(line.number);
    if (!path) return;
    const color = kit.colors.of(line.number);
    const frame = frameAt(path, 0);
    const portal = new Group();
    const ring = new Mesh(ringShape, new MeshBasicMaterial());
    const veil = new Mesh(veilShape, glowing({ color: { value: color }, uTime: uniforms.uTime }, veilShader));
    portal.add(ring, veil);
    portal.position.copy(frame.point).add(new Vector3(0, 0.4, 0));
    portal.rotation.y = Math.atan2(frame.tangent.x, frame.tangent.z);
    group.add(portal);

    const holoColor = new Color();
    const holoMaterial = glowing(
      {
        map: { value: kit.own(hologramTexture(line, fonts)) },
        color: { value: holoColor },
        uTime: uniforms.uTime,
        uOpacity: { value: 1 },
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
    holos.push({ holo, base: holo.position.y });

    // Stream of light: sparks running along the line towards the end, a little above the deck.
    const count = Math.round(path.getLength() * 3);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = Float32Array.from({ length: count }, () => 0.09 + 0.08 * Math.random());
    const points = sparks(kit, { positions, colors, sizes, intensity: 3.2 });
    group.add(points);
    flows.push({
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
      cone.visible = !day;
      for (let index = 0; index < colors.length; index += 3) color.toArray(colors, index);
      points.geometry.getAttribute('color').needsUpdate = true;
    });
  });

  // The end: a beam into the sky, a ring of each line colour turning round it, sparks rising.
  const end = at(model.end.xy);
  const centre = new Vector3(end.x, 0, end.z - terminusBack);
  const beam = new Mesh(
    new CylinderGeometry(0.16, 0.16, 120, 24, 1, true),
    glowing({ uTime: uniforms.uTime }, beamShader),
  );
  beam.position.copy(centre).setY(60 + 3.2);
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
  kit.theme.on((day) => {
    beam.visible = !day;
    sparksUp.visible = !day;
    rings.forEach(({ ring, color }) => ring.material.color.copy(color).multiplyScalar(day ? 1 : 2.6));
  });

  const update = (time: number, camera: Camera) => {
    holos.forEach(({ holo, base }, index) => {
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
  return { group, update };
}
