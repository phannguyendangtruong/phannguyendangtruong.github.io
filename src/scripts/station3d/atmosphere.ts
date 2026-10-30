import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Vector3 } from 'three';
import type { Kit } from './assets';
import { glowing } from './magic-shaders';
import { stationLift, terminusBack, type Anchor } from './station';
import { mistTexture } from './textures';
import { smooth } from './wake';

/** Each sheet of mist: its height over the ground, its opacity by night, and how many times its noise repeats. */
const sheets: [number, number, number][] = [
  [0.7, 0.16, 7],
  [1.6, 0.1, 11],
];

/** Colour of the mist by night (city haze) and by day (warm white). */
const nightMist = 0x8c93a8;
const dayMist = 0xfff1e2;

/** Soft column round the beam of the end, brightest where it faces the camera, fading with height. */
const haloVertex = `varying vec2 vUv; varying vec3 vNormalV; varying vec3 vView;
  void main() {
    vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal); vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const haloShader = `uniform float uOn; varying vec2 vUv; varying vec3 vNormalV; varying vec3 vView;
  void main() {
    float facing = abs(dot(vNormalV, vView));
    float k = pow(min(facing, 1.0), 3.0) * pow(max(1.0 - vUv.y, 0.0), 1.6) * 0.16 * uOn;
    gl_FragColor = vec4(vec3(1.0, 0.82, 0.6) * k, 1.0);
  }`;

/** Cone of light under the canopy of a station, brightest at the canopy. */
const coneShader = `uniform float uOn; varying vec2 vUv;
  void main() { float k = pow(max(vUv.y, 0.0), 1.5) * 0.12 * uOn; gl_FragColor = vec4(vec3(1.0, 0.8, 0.55) * k, 1.0); }`;

export type Atmosphere = { group: Group; update: (time: number) => void };

/**
 * Air of the city: two thin sheets of mist drifting just over the ground (warm white by day), a soft column of light
 * round the beam of the end, and a cone of light under the canopy of every project station, as if seen through the
 * haze. The column and the cones are night things and come on with the wake (wake.ts). `end` is the end on the
 * ground, `stations` the label points of the stations (station.ts).
 */
export function buildAtmosphere(kit: Kit, end: Vector3, stations: Anchor[]): Atmosphere {
  const group = new Group();
  const noise = kit.own(mistTexture());
  const plane = new PlaneGeometry(260, 220);
  const mist = sheets.map(([height, opacity, repeat], index) => {
    const map = index === 0 ? noise : kit.own(noise.clone());
    map.needsUpdate = true;
    map.repeat.set(repeat, repeat * 0.8);
    const material = new MeshBasicMaterial({ map, color: nightMist, transparent: true, opacity, depthWrite: false });
    const sheet = new Mesh(plane, material);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.y = height;
    sheet.renderOrder = 2 + index;
    group.add(sheet);
    return { material, opacity };
  });

  const haloOn = { value: 1 };
  const halo = new Mesh(
    new CylinderGeometry(1.4, 2.2, 40, 32, 1, true).translate(0, 20, 0),
    glowing({ uOn: haloOn }, haloShader, haloVertex),
  );
  halo.position.set(end.x, 3.2, end.z - terminusBack);
  group.add(halo);

  const coneOn = { value: 1 };
  const coneMaterial = glowing({ uOn: coneOn }, coneShader);
  const coneShape = new CylinderGeometry(0.5, 1.1, 0.6, 24, 1, true);
  stations.forEach(({ position }) => {
    const cone = new Mesh(coneShape, coneMaterial);
    cone.position.copy(position).setY(position.y - stationLift + 0.33);
    group.add(cone);
  });

  let isDay = false;
  const refresh = () => {
    haloOn.value = isDay ? 0 : smooth(0.75, 0.95, kit.wake.value);
    coneOn.value = isDay ? 0 : smooth(0.45, 0.7, kit.wake.value);
    halo.visible = haloOn.value > 0;
  };
  kit.wake.on(refresh);
  kit.theme.on((day) => {
    isDay = day;
    mist.forEach(({ material, opacity }) => {
      material.color.set(day ? dayMist : nightMist);
      material.opacity = opacity * (day ? 0.9 : 1);
    });
    refresh();
  });

  const update = (time: number) => {
    mist.forEach(({ material }, index) => {
      material.map?.offset.set(time * (0.004 + index * 0.002), time * (0.002 - index * 0.001));
    });
  };
  return { group, update };
}
