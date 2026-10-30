import {
  HalfFloatType,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Scene,
  type WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const quad =
  'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/** One direction of the tilt-shift blur: sharp in a band round `focus` (a share of the height), softer away from it. */
function tiltShift(direction: 'h' | 'v') {
  return {
    uniforms: {
      tDiffuse: { value: null },
      texel: { value: new Vector2() },
      focus: { value: 0.5 },
      band: { value: 0.12 },
      amount: { value: 3.2 },
    },
    vertexShader: quad,
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 texel; uniform float focus; uniform float band; uniform float amount;
      varying vec2 vUv;
      void main() {
        float d = max(0.0, abs(vUv.y - focus) - band);
        float spread = smoothstep(0.0, 0.45, d) * amount;
        vec2 step_ = vec2(${direction === 'h' ? '1.0, 0.0' : '0.0, 1.0'}) * texel * spread;
        vec4 sum = texture2D(tDiffuse, vUv) * 0.1964825501511404;
        sum += (texture2D(tDiffuse, vUv + step_ * 1.411764705882353) + texture2D(tDiffuse, vUv - step_ * 1.411764705882353)) * 0.2969069646728344;
        sum += (texture2D(tDiffuse, vUv + step_ * 3.2941176470588234) + texture2D(tDiffuse, vUv - step_ * 3.2941176470588234)) * 0.09447039785044732;
        sum += (texture2D(tDiffuse, vUv + step_ * 5.176470588235294) + texture2D(tDiffuse, vUv - step_ * 5.176470588235294)) * 0.010381362401148057;
        gl_FragColor = sum;
      }`,
  };
}

/** Lens and film: a little colour fringe towards the edges, a cool lift in the shadows, vignette, grain. */
const grade = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, vignette: { value: 0.9 }, grain: { value: 0.018 } },
  vertexShader: quad,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform float vignette; uniform float grain; varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 shift = c * r2 * 0.012;
      vec3 col = vec3(texture2D(tDiffuse, vUv + shift).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - shift).b);
      col += vec3(0.0, 0.004, 0.012) * (1.0 - smoothstep(0.0, 0.25, dot(col, vec3(0.33))));
      col *= mix(1.0, smoothstep(0.95, 0.1, r2 * 2.2), vignette);
      col += (rand(vUv * 1000.0 + fract(uTime)) - 0.5) * grain;
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};

export type Post = {
  /** Size of the canvas in CSS pixels and its pixel ratio. */
  setSize: (width: number, height: number, ratio: number) => void;
  /** Light theme: no bloom, a lighter vignette and grain. */
  setDay: (day: boolean) => void;
  /** Height of the band kept sharp (0 at the bottom, 1 at the top) and the strength of the blur round it. */
  setFocus: (focus: number, amount: number) => void;
  render: (time: number) => void;
  dispose: () => void;
};

/**
 * The look of a lit model shot at night: the scene rendered with `samples` of multisampling into a half-float target,
 * bloom (strength 0.5, radius 0.38, threshold 0.92), a tilt-shift blur in both directions, a lens and film grade, then
 * tone mapping and colour space (OutputPass, from the tone mapping of the renderer).
 */
export function buildPost(renderer: WebGLRenderer, scene: Scene, camera: Camera, samples: number): Post {
  const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples });
  const composer = new EffectComposer(renderer, target);
  const render = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.5, 0.38, 0.92);
  const across = new ShaderPass(tiltShift('h'));
  const down = new ShaderPass(tiltShift('v'));
  const look = new ShaderPass(grade);
  const output = new OutputPass();
  [render, bloom, across, down, look, output].forEach((pass) => composer.addPass(pass));
  return {
    setSize: (width, height, ratio) => {
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
      across.uniforms.texel.value.set(1 / (width * ratio), 1 / (height * ratio));
      down.uniforms.texel.value.set(1 / (width * ratio), 1 / (height * ratio));
    },
    setDay: (day) => {
      bloom.enabled = !day;
      look.uniforms.vignette.value = day ? 0.35 : 0.9;
      look.uniforms.grain.value = day ? 0.01 : 0.018;
    },
    setFocus: (focus, amount) => {
      across.uniforms.focus.value = focus;
      down.uniforms.focus.value = focus;
      across.uniforms.amount.value = amount;
      down.uniforms.amount.value = amount;
    },
    render: (time) => {
      look.uniforms.uTime.value = time;
      composer.render();
    },
    dispose: () => {
      [render, bloom, across, down, look, output].forEach((pass) => pass.dispose());
      composer.dispose();
    },
  };
}
