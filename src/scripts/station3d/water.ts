import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  type ShaderMaterial,
} from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { Kit } from './assets';
import { groundSize, riverWidth, type CityPlan } from './layout';

export type Water = {
  group: Group;
  /** Ripples of the reflecting water at `time`. */
  update: (time: number) => void;
  /** Size of the reflection, in pixels (loop.ts sets it from the canvas). */
  setSize: (width: number, height: number) => void;
  /** Frees the render target of the reflection. */
  dispose: () => void;
};

/** Level of the water, below the cut of the ground along the river. */
const waterY = -0.32;

/** Reflection of the city on dark water, rippled and glinting at night, a calm grey-blue by day. */
const waterShader = {
  name: 'WaterShader',
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uTime: { value: 0 },
    uDay: { value: 0 },
  },
  vertexShader: `
    uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vWorld;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 color; uniform sampler2D tDiffuse; uniform float uTime; uniform float uDay; varying vec4 vUv; varying vec3 vWorld;
    void main() {
      vec2 p = vWorld.xz;
      vec2 ripple = vec2(sin(p.y * 2.3 + uTime * 0.9) + sin(p.x * 3.7 - uTime * 1.3) * 0.6,
                         cos(p.x * 2.1 + uTime * 0.7) + sin((p.x + p.y) * 4.3 + uTime * 1.7) * 0.5) * vec2(0.0012, 0.0035);
      vec4 uv = vUv; uv.xy += ripple * uv.w;
      vec3 reflection = texture2DProj(tDiffuse, uv).rgb;
      float glint = pow(max(0.0, sin(p.x * 9.0 + uTime * 1.1) * sin(p.y * 7.0 - uTime * 0.8)), 24.0) * 0.08;
      vec3 base = mix(vec3(0.004, 0.008, 0.014), vec3(0.05, 0.085, 0.11), uDay);
      gl_FragColor = vec4(reflection * color * mix(1.0, 0.55, uDay) + base + glint * (1.0 - uDay) * vec3(0.6, 0.7, 0.9), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};

/** Walls of the embankment on both banks: the edge of the river, from the water up to the ground. */
function embankment(plan: CityPlan): Mesh {
  const positions: number[] = [];
  [-1, 1].forEach((side) => {
    plan.river.slice(1).forEach(([bx, bz], index) => {
      const [ax, az] = plan.river[index];
      const length = Math.hypot(bx - ax, bz - az);
      const nx = (-(bz - az) / length) * riverWidth.half * side;
      const nz = ((bx - ax) / length) * riverWidth.half * side;
      const [px, pz, qx, qz] = [ax + nx, az + nz, bx + nx, bz + nz];
      positions.push(px, 0, pz, qx, 0, qz, qx, -0.5, qz, px, 0, pz, qx, -0.5, qz, px, -0.5, pz);
    });
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return new Mesh(geometry, new MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.9, side: DoubleSide }));
}

/**
 * The river under the cut of the ground, with its embankment. `reflect` (full level): water that mirrors the city at
 * the size the loop sets (half the canvas on a wide window, less on a phone), without multisampling. Otherwise (lite
 * level): a dark, rough metal sheet that only takes the light of the environment, with no second render of the scene.
 */
export function buildWater(plan: CityPlan, kit: Kit, reflect: boolean): Water {
  const group = new Group();
  group.add(embankment(plan));
  if (!reflect) {
    const material = new MeshStandardMaterial({ color: 0x0b121b, roughness: 0.35, metalness: 0.4 });
    kit.theme.on((day) => {
      material.color.set(day ? 0x6f8aa3 : 0x0b121b);
    });
    const sheet = new Mesh(new PlaneGeometry(groundSize.x, groundSize.z), material);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.y = waterY;
    group.add(sheet);
    return { group, update: () => undefined, setSize: () => undefined, dispose: () => undefined };
  }

  const xs = plan.river.map(([x]) => x);
  const zs = plan.river.map(([, z]) => z);
  const width = Math.max(...xs) - Math.min(...xs) + riverWidth.half * 4;
  const depth = Math.max(...zs) - Math.min(...zs) + riverWidth.half * 4;
  const mirror = new Reflector(new PlaneGeometry(width, depth), {
    textureWidth: Math.round(innerWidth * 0.5),
    textureHeight: Math.round(innerHeight * 0.5),
    multisample: 0,
    clipBias: 0.003,
    color: 0xb4c0cf,
    shader: waterShader,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set((Math.max(...xs) + Math.min(...xs)) / 2, waterY, (Math.max(...zs) + Math.min(...zs)) / 2);
  group.add(mirror);
  // The reflector copies the uniforms of the shader: these are its own.
  const uniforms = (mirror.material as ShaderMaterial).uniforms;
  kit.theme.on((day) => {
    uniforms.uDay.value = day ? 1 : 0;
  });
  return {
    group,
    update: (time) => {
      uniforms.uTime.value = time;
    },
    setSize: (reflectionWidth, reflectionHeight) => {
      const target = mirror.getRenderTarget();
      target.setSize(Math.max(1, Math.round(reflectionWidth)), Math.max(1, Math.round(reflectionHeight)));
    },
    dispose: () => mirror.dispose(),
  };
}
