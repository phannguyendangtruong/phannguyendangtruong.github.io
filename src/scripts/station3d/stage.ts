import { PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { loadAssets, type Freeable } from './assets';
import type { Layout } from './level';
import { startLoop, type Loop } from './loop';
import type { SceneModel } from './model';
import { loadSignFonts } from './textures';

export type StageOptions = {
  /** Layout of the scene: the full level on a wide or a narrow window, or the lite level (level.ts). */
  layout: Layout;
  /** Layer of the canvas, and layer of the labels (Station3D.astro). */
  host: HTMLElement;
  labels: HTMLElement;
  model: SceneModel;
  /** Hero map (NetworkMap.astro) and its pause button. */
  netmap: HTMLElement | null;
  pause: HTMLElement | null;
  /**
   * Called when the scene cannot run: a file of public/scene/city/ fails to load, or the browser drops the WebGL
   * context. The page goes back to the SVG map.
   */
  onLost: () => void;
  /** Called when the full level still runs too slowly at its lowest pixel ratio (loop.ts). */
  onSlow: () => void;
};

export type Stage = { stop: () => void };

/**
 * Draws the night city into `host`: at the full level behind the whole home page, every shot framed beside its
 * platform panel and no label over a panel on a wide window, upright shots between the stacked cards and only the main
 * labels that fit on a narrow one; at the lite level in the hero map box, a smaller city round the trunk and the end
 * with only the main labels that fit (loop.ts). Its textures, its HDRI and the fonts of its holograms are fetched
 * first, only now that a level runs; it frees everything, GPU memory included, on stop.
 */
export function startStage({ layout, host, labels, model, netmap, pause, onLost, onSlow }: StageOptions): Stage {
  const level = layout === 'lite' ? 'lite' : 'full';
  const full = level === 'full';
  host.dataset.level = level;
  labels.dataset.level = level;
  host.hidden = false;
  labels.hidden = false;

  // Multisampling comes from the render target of the post-processing (post.ts), not from the canvas.
  const renderer = new WebGLRenderer({ antialias: false, powerPreference: full ? 'high-performance' : 'default' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  host.append(renderer.domElement);
  const css = new CSS2DRenderer({ element: labels });

  let stopped = false;
  let loop: Loop | null = null;
  // Textures and render targets made for the scene, freed on stop; one that comes in after the stop is freed at once.
  const owned = new Set<Freeable>();
  const own = <T extends Freeable>(item: T): T => {
    if (stopped) item.dispose();
    else owned.add(item);
    return item;
  };
  const lost = () => onLost();
  renderer.domElement.addEventListener('webglcontextlost', lost);

  Promise.all([loadAssets(renderer, own), loadSignFonts(model)])
    .then(([assets, fonts]) => {
      if (stopped) return;
      loop = startLoop({ layout, host, netmap, pause, model, renderer, css, assets, fonts, own, onSlow });
    })
    .catch(() => {
      if (!stopped) onLost();
    });

  const stop = () => {
    stopped = true;
    loop?.stop();
    loop = null;
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    host.classList.remove('is-ready');
    netmap?.classList.remove('is-3d');
    host.hidden = true;
    labels.hidden = true;
    delete host.dataset.level;
    delete labels.dataset.level;
    owned.forEach((item) => item.dispose());
    owned.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    labels.replaceChildren();
    labels.removeAttribute('style');
  };

  return { stop };
}
