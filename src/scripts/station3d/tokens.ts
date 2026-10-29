import {
  AdditiveBlending,
  Color,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SpriteMaterial,
  type Material,
  type Texture,
} from 'three';

/**
 * Fixed colours of the light sources (lamps, train windows, sky and moon light). They light the scene and are not
 * page colours, so they have no CSS token; every page colour comes from the tokens of src/styles/global.css.
 */
export const lamp = {
  warm: '#fff3d6',
  window: '#ffe9c2',
  sky: '#9fb3d1',
  moon: '#cfd8ff',
  day: '#ffffff',
} as const;

/** A CSS custom property ("--bg"), a fixed colour ("#fff3d6"), or two custom properties mixed half and half. */
export type Source = string | readonly [string, string];

export type Theme = {
  dark: boolean;
  /** Share of the self-lit parts (tracks, rings, lamps) and of the additive halos: full in the dark theme only. */
  glow: number;
  halo: number;
  /** Intensity of the sky light and of the key light, and exposure of the tone mapping. */
  sky: number;
  sun: number;
  exposure: number;
  color: (source: Source) => Color;
};

/** Theme in use on the page (html[data-theme]), its colours read from the CSS tokens. */
export function readTheme(): Theme {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const one = (value: string): Color =>
    value.startsWith('--') ? new Color().setStyle(style.getPropertyValue(value).trim() || '#000000') : new Color(value);
  const color = (source: Source): Color =>
    typeof source === 'string' ? one(source) : one(source[0]).lerp(one(source[1]), 0.5);
  if (root.dataset.theme === 'light') return { dark: false, glow: 0.35, halo: 0.25, sky: 1.6, sun: 1.1, exposure: 1, color };
  return { dark: true, glow: 1, halo: 1, sky: 0.35, sun: 0.55, exposure: 1.05, color };
}

type Paintable = MeshStandardMaterial | MeshBasicMaterial | SpriteMaterial;

type Paint = { material: Paintable; source: Source; emissive: number; opacity: number };

type StandardOptions = { emissive?: number; roughness?: number; metalness?: number; transparent?: boolean };

/** Materials painted from the theme, painted again when the visitor switches theme. */
export class Palette {
  private readonly paints: Paint[] = [];
  private readonly base = new WeakMap<Material, number>();
  private theme: Theme = readTheme();

  /** Lit surface; `emissive` is how much it shines by itself in the dark theme. */
  standard(source: Source, options: StandardOptions = {}): MeshStandardMaterial {
    const { emissive = 0, roughness = 0.5, metalness = 0, transparent = false } = options;
    return this.add(new MeshStandardMaterial({ roughness, metalness, transparent }), source, emissive, 1);
  }

  /** Additive light (light spilled on the ground, beams); `opacity` is its strength in the dark theme. */
  halo(source: Source, opacity: number, map: Texture | null = null): MeshBasicMaterial {
    const material = new MeshBasicMaterial({ map, transparent: true, blending: AdditiveBlending, depthWrite: false });
    return this.add(material, source, 0, opacity);
  }

  /** Additive glow that always faces the camera (headlamps). */
  sprite(source: Source, opacity: number, map: Texture): SpriteMaterial {
    const material = new SpriteMaterial({ map, transparent: true, blending: AdditiveBlending, depthWrite: false });
    return this.add(material, source, 0, opacity);
  }

  /** Opacity of a material in the theme in use, before any fade. */
  opacity(material: Material): number {
    return this.base.get(material) ?? 1;
  }

  apply(theme: Theme): void {
    this.theme = theme;
    this.paints.forEach((paint) => this.paint(paint));
  }

  private add<M extends Paintable>(material: M, source: Source, emissive: number, opacity: number): M {
    const paint: Paint = { material, source, emissive, opacity };
    this.paints.push(paint);
    this.paint(paint);
    return material;
  }

  private paint({ material, source, emissive, opacity }: Paint): void {
    const color = this.theme.color(source);
    material.color.copy(color);
    if (material instanceof MeshStandardMaterial && emissive > 0) {
      material.emissive.copy(color);
      material.emissiveIntensity = emissive * this.theme.glow;
    }
    const value = material.blending === AdditiveBlending ? opacity * this.theme.halo : opacity;
    material.opacity = value;
    this.base.set(material, value);
  }
}
