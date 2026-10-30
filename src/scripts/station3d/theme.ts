import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  NeutralToneMapping,
  Vector3,
  type Scene,
  type Texture,
  type WebGLRenderer,
} from 'three';
import type { Uniforms } from './assets';

/** Haze of city light at the horizon of the night sky, which the night fog fades into; the warm haze of golden hour. */
export const horizon = new Color(0.028, 0.026, 0.04);
export const dayHaze = new Color(0.91, 0.88, 0.84);

/**
 * Where the sun of the light theme stands from the look point: low in the west, behind the viewer's shoulder, so the
 * fronts facing the camera catch the golden light and the towers cast long shadows. The sky dome (sky.ts) glows round
 * the same direction.
 */
export const sunFrom = new Vector3(-46, 30, 58);

/**
 * Parts of the scene that change with the page theme register here; `apply` runs them all, so a theme change repaints
 * the scene without building anything again.
 */
export class ThemeSwitch {
  private readonly listeners: ((day: boolean) => void)[] = [];

  on(listener: (day: boolean) => void): void {
    this.listeners.push(listener);
  }

  apply(day: boolean): void {
    this.listeners.forEach((listener) => listener(day));
  }
}

/** Reflections of the night (the HDRI of a city at night) and of the day (a studio of soft light panels). */
export type Environments = { night: Texture; day: Texture };

/** Shadow map of the sun, in pixels a side, and the half width of the box it covers round the look point. */
export type SunShadow = { size: number; reach: number };

/**
 * Light of the scene. Night: reflections of the night HDRI, a faint sky light and moonlight, ACES tone mapping, fog
 * fading into the haze of the horizon. Day (the light theme, a model at golden hour): a studio of light panels, a sky
 * light between a cool sky and warm ground, a low warm sun with shadows in a box that follows the look point, Neutral
 * tone mapping, a warm haze.
 */
export class Lighting {
  readonly fog = new FogExp2(horizon.clone(), 0.0068);
  private readonly scene: Scene;
  private readonly env: Environments;
  private readonly sky = new HemisphereLight(0x23304a, 0x120c08, 0.12);
  private readonly moon = new DirectionalLight(0x9db4ff, 0.22);
  private readonly sun = new DirectionalLight(0xffd7ad, 0);
  private day = false;

  /** `shadow`: a smaller map for a phone, over a smaller box for the close shot of the lite level. */
  constructor(scene: Scene, env: Environments, { size, reach }: SunShadow) {
    this.scene = scene;
    this.env = env;
    this.moon.position.set(-40, 80, -60);
    const shadow = this.sun.shadow;
    shadow.mapSize.set(size, size);
    shadow.camera.left = -reach;
    shadow.camera.right = reach;
    shadow.camera.top = reach;
    shadow.camera.bottom = -reach;
    shadow.camera.near = 1;
    shadow.camera.far = 220;
    shadow.camera.updateProjectionMatrix();
    shadow.bias = -0.0004;
    shadow.normalBias = 0.03;
    scene.fog = this.fog;
    scene.add(this.sky, this.moon, this.sun, this.sun.target);
  }

  /** Lights the scene for the theme; the fog of the point lights (sparks.ts) follows through `uniforms`. */
  apply(day: boolean, renderer: WebGLRenderer, uniforms: Uniforms): void {
    this.day = day;
    this.scene.environment = day ? this.env.day : this.env.night;
    this.scene.environmentIntensity = day ? 0.75 : 1;
    this.sky.color.set(day ? 0xdfe3ee : 0x23304a);
    this.sky.groundColor.set(day ? 0xb8957a : 0x120c08);
    this.sky.intensity = day ? 1.05 : 0.12;
    this.moon.intensity = day ? 0 : 0.22;
    this.sun.intensity = day ? 3.3 : 0;
    this.sun.castShadow = day;
    this.fog.color.copy(day ? dayHaze : horizon);
    this.fog.density = day ? 0.0058 : 0.0068;
    uniforms.fogColor.value.copy(this.fog.color);
    uniforms.fogDensity.value = this.fog.density;
    renderer.toneMapping = day ? NeutralToneMapping : ACESFilmicToneMapping;
  }

  /** Keeps the box of the sun's shadows on what the camera looks at. */
  follow(look: Vector3): void {
    if (!this.day) return;
    this.sun.target.position.copy(look);
    this.sun.position.copy(look).add(sunFrom);
  }

  /** Frees the shadow maps. */
  dispose(): void {
    this.sun.dispose();
    this.moon.dispose();
  }
}
