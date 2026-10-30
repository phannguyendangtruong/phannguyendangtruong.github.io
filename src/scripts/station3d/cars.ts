import {
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  Vector4,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Kit } from './assets';
import { trafficGlsl, traffic } from './ground';
import { boulevard, grid, riverWidth, type Area, type CityPlan } from './layout';
import { wakeGlsl } from './wake';

const f = (value: number, digits = 2) => value.toFixed(digits);

/**
 * A car about 4.5 m long, its nose towards +z: a body and, above 0.066, a cabin. Instanced: the attributes of the
 * shape, an instance a slot of a lane.
 */
function carShape(): InstancedBufferGeometry {
  const body = new BoxGeometry(0.12, 0.05, 0.26).translate(0, 0.04, 0);
  const cabin = new BoxGeometry(0.1, 0.036, 0.14).translate(0, 0.083, -0.01);
  const shape = mergeGeometries([body, cabin]);
  body.dispose();
  cabin.dispose();
  if (!shape) throw new Error('Cảnh 3D: không ghép được hình chiếc xe (cars.ts)');
  const geometry = new InstancedBufferGeometry();
  geometry.setIndex(shape.index);
  geometry.setAttribute('position', shape.getAttribute('position'));
  geometry.setAttribute('normal', shape.getAttribute('normal'));
  return geometry;
}

/**
 * Slots of every lane of the grid roads in `area`, one instance each: axis (0 a road along z, 1 along x), where the
 * road runs on the other axis, its index on the grid (its id comes from it in the shader, as on the ground), the
 * direction of the lane; then the stretch of the road in the area and the number of the slot from its start.
 */
function laneSlots(area: Area): { road: Float32Array; span: Float32Array } {
  const roads: [number, number, number, number, number][] = [];
  const P = grid.pitch;
  for (let k = Math.ceil(area.x0 / P); k * P <= area.x1; k += 1) roads.push([0, k * P, k, area.z0, area.z1]);
  for (let j = Math.ceil(area.z0 / P); j * P <= area.z1; j += 1) roads.push([1, j * P, j, area.x0, area.x1]);
  const road: number[] = [];
  const span: number[] = [];
  roads.forEach(([axis, at, index, from, to]) => {
    [1, -1].forEach((dir) => {
      const count = Math.ceil((to - from) / traffic.slot) + 1;
      for (let n = 0; n < count; n += 1) {
        road.push(axis, at, index, dir);
        span.push(from, to, n);
      }
    });
  });
  return { road: new Float32Array(road), span: new Float32Array(span) };
}

/**
 * Where the car of a slot stands and how big it is (0 for none), in the vertex shader. It is the head of the trail of
 * the slot the ground draws (ground.ts, the same GLSL), a little ahead of it; it fades out near the edge of the area,
 * at the embankment of the river and where a boulevard runs along the road, all places the ground draws no trail.
 */
function carVertex(segmentCount: number, riverCount: number): string {
  const slot = f(traffic.slot, 1);
  const clearRiver = riverWidth.half + riverWidth.bank;
  return `
    float dir = aRoad.w;
    float id = laneId(aRoad.x < 0.5 ? roadAlongZ(aRoad.z) : roadAlongX(aRoad.z), dir);
    float n = floor(trailSlot(aSpan.x, id, dir)) + aSpan.z;
    float along = ((dir > 0.0 ? n : n + 1.0) - trailOffset(id)) * ${slot} - dir * uTime * trailSpeed(id);
    along -= dir * 0.1;
    float lane = aRoad.y + ${f(traffic.lane)} * dir;
    vec3 carAt = aRoad.x < 0.5 ? vec3(lane, 0.0, along) : vec3(along, 0.0, lane);
    vec3 ahead = aRoad.x < 0.5 ? vec3(0.0, 0.0, -dir) : vec3(-dir, 0.0, 0.0);
    vec3 right = vec3(ahead.z, 0.0, -ahead.x);
    float dRiver = 1e5;
    for (int i = 0; i < ${riverCount - 1}; i++) dRiver = min(dRiver, segD(carAt.xz, uRiver[i], uRiver[i + 1]));
    // A boulevard along the road covers the trail; one crossing it does not hide the car.
    float dFore = 1e5; float dAft = 1e5;
    for (int i = 0; i < ${segmentCount}; i++) {
      dFore = min(dFore, segD(carAt.xz + ahead.xz * 1.6, uSegs[i].xy, uSegs[i].zw));
      dAft = min(dAft, segD(carAt.xz - ahead.xz * 1.6, uSegs[i].xy, uSegs[i].zw));
    }
    float carSize = trailKeep(n, id)
      * smoothstep(aSpan.x, aSpan.x + 1.5, along) * (1.0 - smoothstep(aSpan.y - 1.5, aSpan.y, along))
      * smoothstep(${f(clearRiver + 0.1)}, ${f(clearRiver + 0.5)}, dRiver)
      * smoothstep(${f(boulevard.road)}, ${f(boulevard.road + 0.4)}, max(dFore, dAft));
    vec3 objectNormal = right * normal.x + vec3(0.0, normal.y, 0.0) + ahead * normal.z;
    vCar = position;
    vPaint = h11(n * 3.7 + id * 11.0);`;
}

/**
 * Paint of the car by its hash (white, silver, black, navy, red, taxi yellow) and a dark glossy cabin; head lamps of
 * warm white in front, red tail lamps behind, very faint by day, lit with the trail as the wave of the wake passes.
 */
const carFragment = {
  color: `
    vec3 paint = vPaint < 0.3 ? vec3(0.82) : vPaint < 0.5 ? vec3(0.45, 0.47, 0.5) : vPaint < 0.68 ? vec3(0.04)
      : vPaint < 0.8 ? vec3(0.12, 0.16, 0.26) : vPaint < 0.9 ? vec3(0.42, 0.06, 0.05) : vec3(0.85, 0.62, 0.12);
    diffuseColor.rgb = vCar.y > 0.066 ? vec3(0.02, 0.025, 0.03) : paint;`,
  rough: 'roughnessFactor = vCar.y > 0.066 ? 0.08 : 0.35;',
  lamps: `
    float lampRow = step(0.03, abs(vCar.x)) * step(abs(vCar.x), 0.056) * step(0.042, vCar.y) * step(vCar.y, 0.06);
    vec3 lamps = vec3(1.0, 0.9, 0.75) * step(0.128, vCar.z) * 5.0 + vec3(1.0, 0.05, 0.02) * step(vCar.z, -0.128) * 3.5;
    totalEmissiveRadiance += lamps * lampRow * mix(1.0, 0.12, uDay) * wakeAt(vCarWorld.xz, blockJitter(vCarWorld.xz));`,
};

/**
 * Cars on the grid roads of `area`, one at the head of every trail of light the ground draws, worked out on the GPU
 * with the same numbers (ground.ts) so that each trail has its car: it moves with the trail and leaves it behind. One
 * instanced geometry and one draw: each instance is a slot of a lane, and its car (or none) and paint follow from the
 * slot. The time of the scene drives them, so they stop with the pause button.
 */
export function buildCars(plan: CityPlan, kit: Kit, area: Area): Mesh {
  const { uniforms } = kit;
  const { road, span } = laneSlots(area);
  const geometry = carShape();
  geometry.instanceCount = road.length / 4;
  geometry.setAttribute('aRoad', new InstancedBufferAttribute(road, 4));
  geometry.setAttribute('aSpan', new InstancedBufferAttribute(span, 3));

  const segments = plan.segments;
  const riverCount = plan.river.length;
  const material = new MeshStandardMaterial({ roughness: 0.35, metalness: 0.6, envMapIntensity: 0.9 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uTime: uniforms.uTime,
      uDay: uniforms.uDay,
      uRiver: { value: plan.river.map(([x, z]) => new Vector2(x, z)) },
      uSegs: { value: segments.map(({ a, b }) => new Vector4(a[0], a[1], b[0], b[1])) },
      ...kit.wake.uniforms,
    });
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec4 aRoad; attribute vec3 aSpan;
        uniform float uTime; uniform vec2 uRiver[${riverCount}]; uniform vec4 uSegs[${segments.length}];
        varying vec3 vCar; varying vec3 vCarWorld; varying float vPaint;
        ${trafficGlsl}
        float segD(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0); return length(p - a - ab * t); }`,
      )
      .replace('#include <beginnormal_vertex>', carVertex(segments.length, riverCount))
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = carAt + (right * position.x + vec3(0.0, position.y, 0.0) + ahead * position.z) * carSize;
        vCarWorld = carAt;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime; uniform float uDay; varying vec3 vCar; varying vec3 vCarWorld; varying float vPaint;
        ${wakeGlsl}
        ${trafficGlsl}`,
      )
      .replace('#include <color_fragment>', `#include <color_fragment>\n${carFragment.color}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${carFragment.rough}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${carFragment.lamps}`);
  };

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
}
