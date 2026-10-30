import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  Points,
  ShaderMaterial,
} from 'three';
import type { Kit } from './assets';

/** Lights of one draw call; the arrays stay the buffers of the geometry, so writing them and flagging moves them. */
export type SparkData = {
  /** x, y, z of each light. */
  positions: Float32Array;
  /** r, g, b of each light, before `intensity`. */
  colors: Float32Array;
  /** Diameter of each light, in scene units. */
  sizes: Float32Array;
  /** Phase of a slow pulse (0 to 1, as the red lights on the towers); a light without one stays on. */
  blink?: Float32Array;
  intensity?: number;
  /** Fades into the fog; false for the stars. */
  fog?: boolean;
};

/**
 * Many small lights in one draw call: soft discs sized in scene units, added to the scene brighter than white so
 * they bloom. In the light theme each is a small dot of its colour drawn over the scene instead.
 */
export function sparks(kit: Kit, data: SparkData): Points<BufferGeometry, ShaderMaterial> {
  const { positions, colors, sizes, intensity = 3, fog = true } = data;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.setAttribute('size', new BufferAttribute(sizes, 1));
  geometry.setAttribute('blink', new BufferAttribute(data.blink ?? new Float32Array(sizes.length), 1));
  const { uniforms } = kit;
  const material = new ShaderMaterial({
    uniforms: {
      uScale: uniforms.uScale,
      uTime: uniforms.uTime,
      uDay: uniforms.uDay,
      uIntensity: { value: intensity },
      fogColor: uniforms.fogColor,
      fogDensity: uniforms.fogDensity,
    },
    vertexShader: `
      attribute float size; attribute float blink; attribute vec3 color;
      uniform float uScale; uniform float uTime;
      varying vec3 vColor; varying float vAlpha; varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.5, size * uScale / -mv.z);
        float pulse = blink > 0.0 ? pow(max(0.0, sin(uTime * 2.4 + blink * 40.0)), 8.0) : 1.0;
        vColor = color; vAlpha = pulse; vDepth = -mv.z;
      }`,
    fragmentShader: `
      uniform float uIntensity; uniform vec3 fogColor; uniform float fogDensity; uniform float uDay;
      varying vec3 vColor; varying float vAlpha; varying float vDepth;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float a = exp(-dot(c, c) * 22.0) * vAlpha;
        float fog = ${fog ? '1.0 - exp(-fogDensity * fogDensity * vDepth * vDepth)' : '0.0'};
        // Night: light added to the scene. Day: a small coloured dot over it.
        gl_FragColor = uDay > 0.5
          ? vec4(vColor * 0.85, min(1.0, a * 1.6) * (1.0 - fog))
          : vec4(vColor * uIntensity * a * (1.0 - fog), 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  kit.theme.on((day) => {
    material.blending = day ? NormalBlending : AdditiveBlending;
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
