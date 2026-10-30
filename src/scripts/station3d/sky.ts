import {
  AdditiveBlending,
  BackSide,
  Color,
  Group,
  MathUtils,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  type Camera,
} from 'three';
import type { Kit } from './assets';
import { sparks } from './sparks';
import { horizon } from './theme';

export type Sky = { group: Group; update: (camera: Camera) => void };

const domeVertex = `varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

/** Dome from the haze of the horizon to the deep blue above, a warm glow of city light low down; pale blue by day. */
const domeShader = `uniform vec3 horizon; uniform float uDay; varying vec3 vDir;
  void main() {
    float h = max(vDir.y, 0.0);
    vec3 top = vec3(0.004, 0.008, 0.022);
    vec3 glow = vec3(0.16, 0.08, 0.06);
    vec3 c = mix(horizon, top, pow(h, 0.45));
    c += glow * exp(-h * 9.0) * 0.6;
    vec3 day = mix(vec3(0.86, 0.89, 0.93), vec3(0.55, 0.69, 0.88), pow(h, 0.6));
    gl_FragColor = vec4(mix(c, day, uDay), 1.0);
  }`;

/**
 * Night sky: a dome, stars, a moon with its halo, and a deck of clouds lit by the moon that the opening shot comes
 * down through. By day a pale blue dome with white clouds, no stars and no moon.
 */
export function buildSky(kit: Kit): Sky {
  const group = new Group();
  const dome = new Mesh(
    new SphereGeometry(420, 48, 24),
    new ShaderMaterial({
      uniforms: { horizon: { value: horizon }, uDay: kit.uniforms.uDay },
      vertexShader: domeVertex,
      fragmentShader: domeShader,
      side: BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  group.add(dome);

  const starCount = 1400;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let index = 0; index < starCount; index += 1) {
    const theta = Math.random() * Math.PI * 2;
    const y = 0.12 + Math.random() ** 0.8 * 0.88;
    const r = Math.sqrt(1 - y * y);
    positions.set([Math.cos(theta) * r * 380, y * 380, Math.sin(theta) * r * 380], index * 3);
    const t = Math.random();
    colors.set([0.75 + t * 0.25, 0.8 + t * 0.15, 1], index * 3);
    sizes[index] = 0.6 + Math.random() ** 3 * 2.4;
  }
  const stars = sparks(kit, { positions, colors, sizes, intensity: 1.4, fog: false });
  group.add(stars);

  const glow = kit.assets.glow;
  const moon = new Sprite(
    new SpriteMaterial({ map: glow, color: new Color(1.6, 1.55, 1.4), fog: false, depthWrite: false }),
  );
  moon.scale.set(14, 14, 1);
  moon.position.set(-150, 160, -260);
  const halo = new Sprite(
    new SpriteMaterial({
      map: glow,
      color: new Color(0.25, 0.3, 0.42),
      fog: false,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  halo.scale.set(110, 110, 1);
  halo.position.copy(moon.position);
  group.add(halo, moon);

  const clouds: Sprite[] = [];
  for (let index = 0; index < 38; index += 1) {
    const material = new SpriteMaterial({
      map: kit.assets.cloud,
      color: new Color(0.62, 0.68, 0.85),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
    });
    material.rotation = Math.random() * Math.PI;
    const cloud = new Sprite(material);
    const size = 22 + Math.random() * 30;
    cloud.scale.set(size * 1.6, size, 1);
    cloud.position.set((Math.random() - 0.5) * 220, 60 + Math.random() * 14, (Math.random() - 0.5) * 200);
    group.add(cloud);
    clouds.push(cloud);
  }
  kit.theme.on((day) => {
    stars.visible = !day;
    moon.visible = !day;
    halo.visible = !day;
    clouds.forEach((cloud) => cloud.material.color.set(day ? 0xffffff : 0x9eadd9));
  });

  // Clouds show only while the camera is up among them, and thin out right next to it.
  const update = (camera: Camera) => {
    const height = MathUtils.smoothstep(camera.position.y, 48, 66);
    clouds.forEach((cloud) => {
      const near = MathUtils.smoothstep(camera.position.distanceTo(cloud.position), 6, 30);
      cloud.material.opacity = 0.5 * height * near;
      cloud.visible = cloud.material.opacity > 0.01;
    });
  };
  return { group, update };
}
