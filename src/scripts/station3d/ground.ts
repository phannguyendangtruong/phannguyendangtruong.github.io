import { DataTexture, Mesh, MeshStandardMaterial, PlaneGeometry, Vector2, Vector4 } from 'three';
import type { Kit } from './assets';
import { boulevard, grid, groundSize, riverWidth, type CityPlan } from './layout';

/** Blocks of the grid under the ground: the first one on each axis, and how many there are. */
const blocks = {
  x0: Math.floor(-groundSize.x / 2 / grid.pitch),
  z0: Math.floor(-groundSize.z / 2 / grid.pitch),
  nx: Math.ceil(groundSize.x / grid.pitch) + 1,
  nz: Math.ceil(groundSize.z / grid.pitch) + 1,
};

/** One texel a block of the grid: red for a park. */
function blockMap(plan: CityPlan): DataTexture {
  const data = new Uint8Array(blocks.nx * blocks.nz * 4);
  for (let i = 0; i < blocks.nx; i += 1) {
    for (let j = 0; j < blocks.nz; j += 1) {
      data[(j * blocks.nx + i) * 4] = plan.isPark(blocks.x0 + i, blocks.z0 + j) ? 255 : 0;
    }
  }
  const texture = new DataTexture(data, blocks.nx, blocks.nz);
  texture.needsUpdate = true;
  return texture;
}

const f = (value: number, digits = 2) => value.toFixed(digits);

/**
 * Ground of the city in one shader: asphalt roads on the grid and boulevards under the viaducts, pavements, parks,
 * yards, an embankment along the river (the river itself is cut out: the water lies below, water.ts), dashed lane
 * markings, pools of street light, the wash of each line's colour under its viaduct, and streams of head and tail
 * lights moving along the lanes like a long exposure. The lights are night things.
 */
export function buildGround(plan: CityPlan, kit: Kit): Mesh {
  const { assets, uniforms, colors } = kit;
  const segments = plan.segments;
  const parks = kit.own(blockMap(plan));
  const material = new MeshStandardMaterial({ roughness: 0.9, envMapIntensity: 0.18 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uAsphalt: { value: assets.asphalt },
      uAsphaltArm: { value: assets.asphaltArm },
      uPave: { value: assets.pavement },
      uGrass: { value: assets.grass },
      uBlocks: { value: parks },
      uSegs: { value: segments.map(({ a, b }) => new Vector4(a[0], a[1], b[0], b[1])) },
      // The colours of the lines themselves: they follow the theme in place.
      uSegColor: { value: segments.map(({ line }) => colors.of(line)) },
      uRiver: { value: plan.river.map(([x, z]) => new Vector2(x, z)) },
      uTime: uniforms.uTime,
      uStreet: uniforms.uStreet,
      uDay: uniforms.uDay,
    });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n varying vec3 vWorld;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vWorld = (modelMatrix * vec4(position, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorld;
        uniform sampler2D uAsphalt; uniform sampler2D uAsphaltArm; uniform sampler2D uPave; uniform sampler2D uGrass;
        uniform sampler2D uBlocks; uniform vec4 uSegs[${segments.length}]; uniform vec3 uSegColor[${segments.length}];
        uniform vec2 uRiver[${plan.river.length}]; uniform float uTime; uniform float uStreet; uniform float uDay;
        float h11(float n) { return fract(sin(n * 91.345) * 47453.2); }
        float segD(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0); return length(p - a - ab * t); }
        float trail(float along, float lane, float road, float dir) {
          float s = (along + dir * uTime * (1.3 + h11(road) * 0.8)) / 2.2 + h11(road * 3.0) * 9.0;
          float f = fract(s);
          float keep = step(h11(floor(s) * 7.13 + road * 1.7), 0.42 + 0.3 * h11(road + 4.0));
          float shape = dir > 0.0 ? pow(f, 6.0) : pow(1.0 - f, 6.0);
          return keep * shape * exp(-lane * lane / 0.0025);
        }
        vec3 gEmit; float gRough;`,
      )
      .replace('#include <map_fragment>', `#include <map_fragment>\n${groundChunk(segments.length, plan.river.length)}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = gRough;')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += gEmit * (1.0 - uDay);',
      );
  };
  const ground = new Mesh(new PlaneGeometry(groundSize.x, groundSize.z), material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

/** Surface and lights of a point of the ground, after the map of the material. */
function groundChunk(segmentCount: number, riverCount: number): string {
  return `
  {
    vec2 p = vWorld.xz;
    float P = ${f(grid.pitch, 1)};
    vec2 g = p - P * floor(p / P + 0.5);
    vec2 roadId = floor(p / P + 0.5);
    float dx = abs(g.x); float dz = abs(g.y);
    float dGrid = min(dx, dz);
    float dTrack = 1e5; vec3 under = vec3(0.0);
    for (int i = 0; i < ${segmentCount}; i++) {
      float d = segD(p, uSegs[i].xy, uSegs[i].zw);
      if (d < dTrack) { dTrack = d; under = uSegColor[i]; }
    }
    float dRiver = 1e5;
    for (int i = 0; i < ${riverCount - 1}; i++) dRiver = min(dRiver, segD(p, uRiver[i], uRiver[i + 1]));
    if (dRiver < ${f(riverWidth.half)}) discard;
    vec2 bUv = (floor(p / P) - vec2(${f(blocks.x0, 1)}, ${f(blocks.z0, 1)}) + 0.5) / vec2(${f(blocks.nx, 1)}, ${f(blocks.nz, 1)});
    bool park = texture2D(uBlocks, bUv).r > 0.5;
    bool bank = dRiver < ${f(riverWidth.half + riverWidth.bank)};
    bool road = !bank && (dGrid < ${f(grid.road)} || dTrack < ${f(boulevard.road)});
    bool walk = !road && (bank || dGrid < ${f(grid.walk)} || dTrack < ${f(boulevard.walk)});
    vec3 asphalt = texture2D(uAsphalt, p * 0.5).rgb * mix(0.2, 0.55, uDay);
    vec3 paveTex = texture2D(uPave, p * 0.9).rgb;
    vec3 pave = mix(paveTex * 0.24, vec3(dot(paveTex, vec3(0.33))) * vec3(0.84, 0.86, 0.9), uDay);
    vec3 grass = texture2D(uGrass, p * 0.22).rgb * mix(vec3(0.16, 0.22, 0.15), vec3(0.5, 0.66, 0.42), uDay);
    vec3 yardTex = texture2D(uPave, p * 0.6).rgb;
    vec3 yard = mix(yardTex * 0.1, vec3(dot(yardTex, vec3(0.33))) * vec3(0.66, 0.68, 0.72), uDay);
    diffuseColor.rgb = road ? asphalt : walk ? pave : park ? grass : yard;
    gRough = road ? 0.35 + texture2D(uAsphaltArm, p * 0.5).g * 0.4 : walk ? 0.75 : 0.95;
    gEmit = vec3(0.0);
    if (road && dTrack > ${f(boulevard.road)}) {
      // Grid road: dashed centre line, streams of lights on both lanes.
      bool alongZ = dx < dz;
      float u = alongZ ? g.x : g.y;
      float along = alongZ ? p.y : p.x;
      float id = alongZ ? roadId.x * 3.1 : roadId.y * 7.7 + 50.0;
      float inCross = step(${f(grid.walk)}, alongZ ? dz : dx);
      float dash = step(abs(u), 0.018) * step(fract(along * 1.3), 0.5) * inCross;
      diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.55, 0.5, 0.38), vec3(0.95), uDay), dash);
      float heads = trail(along, u - 0.27, id, 1.0);
      float tails = trail(along, u + 0.27, id + 0.5, -1.0);
      gEmit += (vec3(1.0, 0.86, 0.62) * heads * 2.2 + vec3(1.0, 0.08, 0.04) * tails * 1.8) * uStreet;
    }
    if (road || walk) {
      // Street lamps every 1.5 units along both pavements of every grid road.
      vec2 lu = vec2(dx - 0.7, (fract(p.y / 1.5) - 0.5) * 1.5);
      vec2 lv = vec2(dz - 0.7, (fract(p.x / 1.5) - 0.5) * 1.5);
      float pool = exp(-dot(lu, lu) * 7.0) * step(dx, 1.4) + exp(-dot(lv, lv) * 7.0) * step(dz, 1.4);
      vec3 lampColor = mix(vec3(1.0, 0.58, 0.24), vec3(0.85, 0.92, 1.0), step(0.55, h11(roadId.x * 5.0 + roadId.y)));
      gEmit += lampColor * pool * 0.14 * uStreet;
    }
    gEmit += under * exp(-dTrack * dTrack * 5.0) * 0.14 * uStreet;
  }`;
}
