import { BoxGeometry, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshStandardMaterial } from 'three';
import type { Kit } from './assets';
import { hash, type Lot } from './layout';
import { wakeGlsl } from './wake';

/** Roof of a building: where its plant, rim, red light and LED crown stand. */
export type Top = { x: number; z: number; top: number; w: number; d: number; seed: number; tower: boolean };

export type Buildings = { mesh: InstancedMesh; tops: Top[] };

/** A box standing on the ground or on another one: x, y, z, width, height, depth, kind, seed, share of lit windows. */
type Box = [number, number, number, number, number, number, number, number, number];

/**
 * Every building of the city in one instanced mesh of unit boxes. A tower is a podium, a slimmer shaft and sometimes a
 * crown set back again; housing and shophouses are one box. The facade is drawn in the shader: a grid of windows by
 * kind (curtain wall for towers, punched windows for housing, a lit shop front at street level for shophouses), each
 * window lit or dark by chance, warm or cool, a few switching over time, with a room seen behind it; roofs carry the
 * bitumen texture. Glass and dark windows reflect the environment of the theme. During the opening shot the windows
 * light up as the wave of the wake passes them (wake.ts).
 */
export function buildBuildings(lots: Lot[], kit: Kit): Buildings {
  const boxes: Box[] = [];
  const tops: Top[] = [];
  lots.forEach(({ x, z, w, d, h, kind, seed }) => {
    if (kind === 0) {
      const podium = 0.6 + seed * 0.6;
      boxes.push([x, 0, z, w, podium, d, 1, seed, 0.35]);
      const sw = w * (0.62 + 0.2 * hash(seed, 1));
      const sd = d * (0.62 + 0.2 * hash(seed, 2));
      boxes.push([x, podium, z, sw, h - podium, sd, 0, seed, 0.18 + 0.3 * hash(seed, 3)]);
      if (hash(seed, 4) < 0.45) {
        const crown = 0.6 + hash(seed, 5) * 1.4;
        boxes.push([x, h, z, sw * 0.7, crown, sd * 0.7, 0, seed + 0.5, 0.2]);
        tops.push({ x, z, top: h + crown, w: sw * 0.7, d: sd * 0.7, seed, tower: true });
      } else {
        tops.push({ x, z, top: h, w: sw, d: sd, seed, tower: true });
      }
    } else {
      boxes.push([x, 0, z, w, h, d, kind, seed, kind === 1 ? 0.18 + 0.3 * hash(seed, 6) : 0.3]);
      tops.push({ x, z, top: h, w, d, seed, tower: false });
    }
  });

  const geometry = new BoxGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0);
  const info = new Float32Array(boxes.length * 3);
  const mesh = new InstancedMesh(geometry, facadeMaterial(kit), boxes.length);
  const matrix = new Matrix4();
  boxes.forEach(([x, y, z, w, h, d, kind, seed, lit], index) => {
    mesh.setMatrixAt(index, matrix.makeScale(w, h, d).setPosition(x, y, z));
    info.set([kind, seed, lit], index * 3);
  });
  geometry.setAttribute('aInfo', new InstancedBufferAttribute(info, 3));
  mesh.frustumCulled = false;
  return { mesh, tops };
}

function facadeMaterial(kit: Kit): MeshStandardMaterial {
  const { assets, uniforms } = kit;
  const material = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0, envMapIntensity: 0.55 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uFacade: { value: assets.facade },
      uRoof: { value: assets.roof },
      uRoofArm: { value: assets.roofArm },
      uTime: uniforms.uTime,
      uWindow: uniforms.uWindow,
      uDay: uniforms.uDay,
      ...kit.wake.uniforms,
    });
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aInfo;
        varying vec3 vInfo; varying vec3 vLocal; varying vec3 vSize; varying vec3 vObjNormal; varying vec3 vWorld;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vLocal = position * vSize;
        vObjNormal = normal;
        vInfo = aInfo;
        vWorld = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uFacade; uniform sampler2D uRoof; uniform sampler2D uRoofArm;
        uniform float uTime; uniform float uWindow; uniform float uDay;
        ${wakeGlsl}
        varying vec3 vInfo; varying vec3 vLocal; varying vec3 vSize; varying vec3 vObjNormal; varying vec3 vWorld;
        float h13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
        vec3 fEmit; float fRough; float fMetal;`,
      )
      .replace('#include <map_fragment>', `#include <map_fragment>\n${facadeChunk}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = fRough;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n metalnessFactor = fMetal;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += fEmit;');
  };
  return material;
}

/**
 * A room behind each window but the shop fronts, seen through the glass with parallax (interior mapping): a ray from
 * the camera into a box as wide and high as the window cell, `depth` deep, finds its back wall, a side wall, the bright
 * ceiling or the darker floor; now and then a dark block of furniture stands against the back wall, and each room has
 * a tint of its own. It shades the light of the window.
 */
const roomChunk = `
      if (shop < 0.5) {
        vec3 V = normalize(vWorld - cameraPosition);
        vec3 T = sideX ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
        vec3 rd = vec3(dot(V, T), V.y, max(dot(V, -vObjNormal), 0.02));
        vec2 room = vec2(px, pitch.y);
        float depth = 0.16 + 0.1 * h13(vec3(id, seed + 9.0));
        vec3 ro = vec3(f * room, 0.0);
        float tx = rd.x > 0.0 ? (room.x - ro.x) / rd.x : -ro.x / min(rd.x, -1e-4);
        float ty = rd.y > 0.0 ? (room.y - ro.y) / rd.y : -ro.y / min(rd.y, -1e-4);
        float tz = depth / rd.z;
        float tHit = min(min(tx, ty), tz);
        vec3 hit = ro + rd * tHit;
        float shade = tHit == tz ? 0.95 - 0.35 * pow(abs(hit.x / room.x - 0.5) * 2.0, 2.0)
                    : tHit == ty ? (rd.y > 0.0 ? 1.3 : 0.36) : 0.6;
        if (tHit == tz && h13(vec3(id, seed + 7.0)) < 0.5 && hit.y < room.y * 0.38 && abs(hit.x / room.x - 0.5) < 0.24) {
          shade *= 0.28;
        }
        vec3 roomTint = vec3(0.86 + 0.28 * h13(vec3(id, seed + 3.0)), 0.92, 0.8 + 0.3 * h13(vec3(id, seed + 4.0)));
        bright *= shade;
        light *= mix(vec3(1.0), roomTint, 0.6);
      }`;

/** Colour, roughness, metalness and light of a facade or a roof, after the map of the material. */
const facadeChunk = `
  {
    float kind = vInfo.x; float seed = vInfo.y; float ratio = vInfo.z;
    fEmit = vec3(0.0); fRough = 0.85; fMetal = 0.0;
    if (vObjNormal.y > 0.5) {
      vec2 ruv = vWorld.xz * 0.45;
      diffuseColor.rgb = texture2D(uRoof, ruv).rgb * mix(0.3, 0.95, uDay);
      fRough = texture2D(uRoofArm, ruv).g;
    } else if (vObjNormal.y < -0.5) {
      diffuseColor.rgb = vec3(0.02);
    } else {
      bool sideX = abs(vObjNormal.x) > 0.5;
      float half_ = sideX ? vSize.z * 0.5 : vSize.x * 0.5;
      float u = (sideX ? vLocal.z : vLocal.x) + half_;
      float y = vWorld.y;
      vec3 tint = mix(vec3(0.42, 0.42, 0.44), vec3(0.62, 0.56, 0.48), h13(vec3(seed * 37.0, 1.0, 2.0)));
      vec3 wall = texture2D(uFacade, vec2(u, y) * 0.35).rgb * tint * mix(0.42, 1.45, uDay);
      vec2 pitch = kind < 0.5 ? vec2(0.15, 0.28) : kind < 1.5 ? vec2(0.26, 0.29) : vec2(0.34, 0.31);
      float cols = max(1.0, floor((half_ * 2.0 - 0.1) / pitch.x));
      float px = (half_ * 2.0 - 0.1) / cols;
      vec2 cell = vec2((u - 0.05) / px, (y - 0.06) / pitch.y);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      vec2 open = kind < 0.5 ? vec2(0.9, 0.8) : kind < 1.5 ? vec2(0.52, 0.56) : vec2(0.62, 0.6);
      vec2 dd = abs(f - 0.5) - open * 0.5;
      float inside = step(0.05, u) * step(u, half_ * 2.0 - 0.05) * step(0.06, y) * step(y, vWorld.y - vLocal.y + vSize.y - 0.08);
      float win = (1.0 - smoothstep(-0.04, 0.04, max(dd.x, dd.y))) * inside;
      float face = dot(vObjNormal, vec3(1.0, 3.0, 7.0));
      float r = h13(vec3(id + face * 17.0, seed * 91.0));
      float slow = floor(uTime / (14.0 + 30.0 * h13(vec3(id, seed))));
      float lit = step(r, ratio);
      if (h13(vec3(id, seed + slow)) < 0.035) lit = 1.0 - lit;
      if (kind < 0.5 && h13(vec3(id.y, seed * 13.0, 2.0)) < 0.22) lit = step(r, 0.93);
      vec3 warm = vec3(1.0, 0.66, 0.36);
      vec3 white = vec3(1.0, 0.9, 0.76);
      vec3 cool = vec3(0.7, 0.86, 1.0);
      float t = h13(vec3(id * 3.1, seed));
      vec3 light = kind < 0.5 ? mix(cool, white, t) : mix(warm, white, t * 0.7);
      if (t > 0.94) light = vec3(0.55, 0.75, 1.0);
      float bright = (0.25 + 0.9 * pow(h13(vec3(id, seed + 5.0)), 2.0)) * (0.7 + 0.45 * f.y);
      // Street level of shophouses and housing: a lit shop front.
      float shop = (kind > 0.5 && y < 0.3) ? 1.0 : 0.0;
      if (shop > 0.5) {
        win = step(0.06, f.x) * step(f.x, 0.94) * step(0.05, y) * step(y, 0.24) * inside;
        lit = step(0.25, h13(vec3(id.x, seed, 4.0)));
        light = mix(vec3(1.0, 0.55, 0.25), vec3(1.0, 0.9, 0.7), h13(vec3(id.x, seed, 5.0)));
        bright = 1.3;
      }
      ${roomChunk}
      vec3 glass = mix(kind < 0.5 ? vec3(0.012, 0.018, 0.026) : vec3(0.012), vec3(0.2, 0.27, 0.34), uDay);
      diffuseColor.rgb = mix(wall, glass, win);
      fRough = mix(0.82, 0.18, win);
      fMetal = mix(0.0, 0.3, win);
      if (kind < 0.5) {
        diffuseColor.rgb = mix(wall * 0.35, glass, max(win, 0.6));
        fRough = mix(0.45, 0.14, win);
        fMetal = mix(0.4, 0.45, win);
      }
      // Each window comes on as the wave of the wake passes it, a little early or late by chance; by day a few still
      // glow faintly warm behind the glass.
      fEmit = win * lit * light * bright * uWindow * mix(1.0, 0.07, uDay) * wakeAt(vWorld.xz, r);
    }
  }`;
