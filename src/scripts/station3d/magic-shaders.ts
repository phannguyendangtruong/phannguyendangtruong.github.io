import { AdditiveBlending, DoubleSide, ShaderMaterial, type IUniform } from 'three';

/** Plain vertex shader passing the uv on. */
const quad =
  'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/** Swirl of light inside the ring of a portal; `uOn` brings it in when the wake reaches the portal. */
export const veilShader = `uniform vec3 color; uniform float uTime; uniform float uOn; varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    float swirl = 0.5 + 0.5 * sin(a * 5.0 + r * 9.0 - uTime * 3.0);
    float k = smoothstep(1.0, 0.2, r) * (0.25 + 0.75 * swirl) * (0.6 + 0.4 * r);
    gl_FragColor = vec4(color * k * 1.8 * uOn, 1.0);
  }`;

/** Vertex shader of a hologram: the uv and the point in the world, for the scan lines. */
export const holoVertex = `varying vec2 vUv; varying vec3 vWorld;
  void main() {
    vUv = uv; vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

/**
 * Hologram: scan lines, a sweep, flicker and a rare glitch over the text; by day the text in the line colour.
 * `uOpacity` brings it in with the wake, `uEmphasis` brightens or dims it while the pointer is on a line.
 */
export const holoShader = `uniform sampler2D map; uniform vec3 color; uniform float uTime; uniform float uOpacity;
  uniform float uDay; uniform float uEmphasis;
  varying vec2 vUv; varying vec3 vWorld;
  void main() {
    float glitch = step(0.985, fract(sin(floor(uTime * 9.0) * 12.9898) * 43758.5)) * 0.012;
    vec2 uv = vUv + vec2(glitch * sin(vUv.y * 80.0), 0.0);
    float a = texture2D(map, uv).a;
    float scan = 0.72 + 0.28 * sin(vWorld.y * 140.0 - uTime * 6.0);
    float sweep = smoothstep(0.0, 0.08, fract(vUv.y * 0.5 - uTime * 0.35)) * 0.4 + 0.6;
    float flicker = 0.9 + 0.1 * sin(uTime * 37.0) * sin(uTime * 13.0);
    float edge = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
    vec3 tint = color * max(0.35, uEmphasis);
    vec3 glow = tint * (a * 2.6 * scan * sweep * flicker + 0.05 * edge);
    gl_FragColor = uDay > 0.5 ? vec4(tint * 0.72, min(1.0, a * 1.5) * uOpacity) : vec4(glow * uOpacity, 1.0);
  }`;

/** Cone of light under a hologram, fading upwards. */
export const coneShader = `uniform vec3 color; varying vec2 vUv;
  void main() {
    float k = (0.25 + 0.75 * (1.0 - vUv.y)) * smoothstep(1.0, 0.85, vUv.y);
    gl_FragColor = vec4(color * k * 0.09, 1.0);
  }`;

/** Beam of the end into the sky, in moving bands, fading with height. */
export const beamShader = `uniform float uTime; varying vec2 vUv;
  void main() {
    float fade = pow(max(1.0 - vUv.y, 0.0), 2.2);
    float bands = 0.75 + 0.25 * sin(vUv.y * 160.0 - uTime * 5.0);
    gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * fade * bands * 0.9, 1.0);
  }`;

/** Light added to the scene, seen from both sides, never hiding what is behind it. */
export function glowing(
  uniforms: Record<string, IUniform>,
  fragmentShader: string,
  vertexShader = quad,
): ShaderMaterial {
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
