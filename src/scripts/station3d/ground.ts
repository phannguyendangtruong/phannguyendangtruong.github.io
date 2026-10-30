import { DataTexture, Mesh, MeshStandardMaterial, PlaneGeometry, Vector2, Vector4 } from 'three';
import type { Kit } from './assets';
import { boulevard, grid, groundSize, riverWidth, type CityPlan } from './layout';
import { wakeGlsl } from './wake';

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
 * Traffic of the grid roads: each lane is cut into slots `slot` long, `lane` from the middle of its road. The ground
 * draws a trail of light in some of the slots and the cars (cars.ts) drive at the heads of the same trails, so both
 * read their numbers from here.
 */
export const traffic = { slot: 2.2, lane: 0.27 };

/**
 * GLSL of the traffic, shared by the ground and the cars; it reads `uTime`, declared before it. A road along z at
 * x = k × pitch has the id `roadAlongZ(k)`, a road along x at z = j × pitch `roadAlongX(j)`; the lane running towards
 * −along (`dir` 1) takes the id of its road, the other one the id + 0.5. `trailSlot` is the slot of a lane under a
 * point at `along` (its whole part numbers the slot), `trailKeep` whether a slot has a trail. `blockJitter` is the
 * jitter of the wake (wake.ts) of the block of the grid under a point: a trail and its car light up together.
 */
export const trafficGlsl = `
  float h11(float n) { return fract(sin(n * 91.345) * 47453.2); }
  float roadAlongZ(float k) { return k * 3.1; }
  float roadAlongX(float j) { return j * 7.7 + 50.0; }
  float laneId(float road, float dir) { return dir > 0.0 ? road : road + 0.5; }
  float trailSpeed(float id) { return 1.3 + h11(id) * 0.8; }
  float trailOffset(float id) { return h11(id * 3.0) * 9.0; }
  float trailSlot(float along, float id, float dir) {
    return (along + dir * uTime * trailSpeed(id)) / ${f(traffic.slot, 1)} + trailOffset(id);
  }
  float trailKeep(float n, float id) { return step(h11(n * 7.13 + id * 1.7), 0.42 + 0.3 * h11(id + 4.0)); }
  float blockJitter(vec2 p) { return fract(sin(dot(floor(p / 6.0), vec2(12.9898, 78.233))) * 43758.5); }`;

/**
 * Ground of the city in one shader: asphalt roads on the grid and boulevards under the viaducts, pavements, parks,
 * yards, an embankment along the river (the river itself is cut out: the water lies below, water.ts), dashed lane
 * markings, pools of street light, the wash of each line's colour under its viaduct, and streams of head and tail
 * lights moving along the lanes like a long exposure, brightest at the front where their car drives (cars.ts). The
 * roads are wet: the nearest street lamps are mirrored in them as streaks running towards the camera, stronger in the
 * smoother puddles. The lights are night things, and come on block by block as the wave of the wake passes (wake.ts).
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
      ...kit.wake.uniforms,
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
        ${wakeGlsl}
        ${trafficGlsl}
        float segD(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0); return length(p - a - ab * t); }
        // Trail of a lane at a point: bright at its head, the front of the slot in the direction of travel.
        float trail(float along, float lane, float road, float dir) {
          float id = laneId(road, dir);
          float s = trailSlot(along, id, dir);
          float f = fract(s);
          float shape = dir > 0.0 ? pow(1.0 - f, 6.0) : pow(f, 6.0);
          return trailKeep(floor(s), id) * shape * exp(-lane * lane / 0.0025);
        }
        vec3 gEmit; float gRough;`,
      )
      .replace('#include <map_fragment>', `#include <map_fragment>\n${groundChunk(segments.length, plan.river.length)}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = gRough;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += gEmit * (1.0 - uDay) * wakeAt(vWorld.xz, blockJitter(vWorld.xz));`,
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
    vec3 lampColor = mix(vec3(1.0, 0.58, 0.24), vec3(0.85, 0.92, 1.0), step(0.55, h11(roadId.x * 5.0 + roadId.y)));
    if (road && dTrack > ${f(boulevard.road)}) {
      // Grid road: dashed centre line, streams of lights on both lanes.
      bool alongZ = dx < dz;
      float u = alongZ ? g.x : g.y;
      float along = alongZ ? p.y : p.x;
      float id = alongZ ? roadAlongZ(roadId.x) : roadAlongX(roadId.y);
      float inCross = step(${f(grid.walk)}, alongZ ? dz : dx);
      float dash = step(abs(u), 0.018) * step(fract(along * 1.3), 0.5) * inCross;
      diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.55, 0.5, 0.38), vec3(0.95), uDay), dash);
      float heads = trail(along, u - ${f(traffic.lane)}, id, 1.0);
      float tails = trail(along, u + ${f(traffic.lane)}, id, -1.0);
      gEmit += (vec3(1.0, 0.86, 0.62) * heads * 2.2 + vec3(1.0, 0.08, 0.04) * tails * 1.8) * uStreet;
    }
    if (road || walk) {
      // Street lamps every 1.5 units along both pavements of every grid road.
      vec2 lu = vec2(dx - 0.7, (fract(p.y / 1.5) - 0.5) * 1.5);
      vec2 lv = vec2(dz - 0.7, (fract(p.x / 1.5) - 0.5) * 1.5);
      float pool = exp(-dot(lu, lu) * 7.0) * step(dx, 1.4) + exp(-dot(lv, lv) * 7.0) * step(dz, 1.4);
      gEmit += lampColor * pool * 0.14 * uStreet;
    }
    if (road && dTrack > ${f(boulevard.road)}) {
      // Wet asphalt: the nearest lamps mirrored in the road as streaks running towards the camera, stronger in the
      // puddles, which are smoother.
      float wet = smoothstep(0.42, 0.62, texture2D(uAsphaltArm, p * 0.11 + 0.37).g);
      float mirrored = 0.0;
      for (int axis = 0; axis < 2; axis++) {
        float side = axis == 0 ? sign(g.x) : sign(g.y);
        vec2 lamp = axis == 0 ? vec2(roadId.x * P + side * 0.7, (floor(p.y / 1.5) + 0.5) * 1.5)
                              : vec2((floor(p.x / 1.5) + 0.5) * 1.5, roadId.y * P + side * 0.7);
        vec2 toCam = normalize(cameraPosition.xz - lamp + 1e-4);
        vec2 rel = p - lamp;
        float along = dot(rel, toCam);
        float perp = length(rel - toCam * along) + sin(along * 37.0 + p.x * 11.0) * 0.012;
        float ahead = along - 0.4;
        mirrored += exp(-perp * perp / 0.004) * exp(-ahead * ahead / 0.1) * step(axis == 0 ? dx : dz, 1.2);
      }
      gEmit += lampColor * mirrored * (0.12 + 0.4 * wet) * uStreet;
      gRough = mix(gRough, 0.06, wet * 0.75);
    }
    gEmit += under * exp(-dTrack * dTrack * 5.0) * 0.14 * uStreet;
  }`;
}
