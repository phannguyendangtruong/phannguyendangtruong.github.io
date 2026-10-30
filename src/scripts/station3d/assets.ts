import {
  EquirectangularReflectionMapping,
  NoColorSpace,
  PMREMGenerator,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Color,
  type IUniform,
  type Texture,
  type WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { cloudTexture, glowTexture } from './textures';
import type { Environments, ThemeSwitch } from './theme';
import type { LineColors } from './tokens';

/** Anything holding GPU memory until it is disposed: a texture, a render target. */
export type Freeable = { dispose: () => void };

/** Keeps `item` to free it when the scene stops, and gives it back. */
export type Own = <T extends Freeable>(item: T) => T;

/** Textures of the city (CC0, Poly Haven), its two environments, and two soft shapes drawn on a canvas. */
export type Assets = {
  roof: Texture;
  /** Ambient occlusion, roughness and metalness in the red, green and blue channels. */
  roofArm: Texture;
  facade: Texture;
  asphalt: Texture;
  asphaltArm: Texture;
  pavement: Texture;
  grass: Texture;
  concrete: Texture;
  concreteNormal: Texture;
  env: Environments;
  glow: Texture;
  cloud: Texture;
};

/** Uniforms shared by the shaders of the city. */
export type Uniforms = {
  /** Seconds of the scene, frozen while the animation is paused. */
  uTime: IUniform<number>;
  /** Pixels a scene unit covers at distance 1: the size of the point lights on screen. */
  uScale: IUniform<number>;
  /** Strength of the lit windows and of the street lights. */
  uWindow: IUniform<number>;
  uStreet: IUniform<number>;
  /** 1 in the light theme, 0 in the dark one. */
  uDay: IUniform<number>;
  fogColor: IUniform<Color>;
  fogDensity: IUniform<number>;
};

/** What every part of the city is built with. */
export type Kit = {
  assets: Assets;
  uniforms: Uniforms;
  colors: LineColors;
  theme: ThemeSwitch;
  own: Own;
};

/** Folder of the scene files (public/scene/city/), under the base path of the site. */
const folder = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/scene/city/`;

/**
 * Loads the textures and the night HDRI from public/scene/city/, and prefilters the two environments for reflections:
 * the HDRI for the night, a studio of soft light panels for the day. Rejects when a file does not load. Everything it
 * makes goes to `own`, freed when the scene stops.
 */
export async function loadAssets(renderer: WebGLRenderer, own: Own): Promise<Assets> {
  const loader = new TextureLoader();
  const load = (name: string, color: boolean) =>
    loader.loadAsync(`${folder}${name}.jpg`).then((texture) => {
      own(texture);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.anisotropy = 8;
      texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
      return texture;
    });
  const [roof, roofArm, facade, asphalt, asphaltArm, pavement, grass, concrete, concreteNormal, hdr] =
    await Promise.all([
      load('bitumen_diff', true),
      load('bitumen_arm', false),
      load('concrete_tile_facade_diff', true),
      load('asphalt_02_diff', true),
      load('asphalt_02_arm', false),
      load('concrete_pavement_diff', true),
      load('aerial_grass_rock_diff', true),
      load('concrete_wall_008_diff', true),
      load('concrete_wall_008_nor_gl', false),
      new HDRLoader().loadAsync(`${folder}night.hdr`),
    ]);
  hdr.mapping = EquirectangularReflectionMapping;
  const pmrem = new PMREMGenerator(renderer);
  const night = own(pmrem.fromEquirectangular(hdr)).texture;
  const room = new RoomEnvironment();
  const day = own(pmrem.fromScene(room, 0.04)).texture;
  room.dispose();
  hdr.dispose();
  pmrem.dispose();
  return {
    roof,
    roofArm,
    facade,
    asphalt,
    asphaltArm,
    pavement,
    grass,
    concrete,
    concreteNormal,
    env: { night, day },
    glow: own(glowTexture()),
    cloud: own(cloudTexture()),
  };
}
