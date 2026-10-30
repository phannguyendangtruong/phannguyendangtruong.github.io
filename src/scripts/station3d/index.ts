import { detectLevel, isNarrow, markSlow, watchLevel, type Layout, type Queries } from './level';
import type { SceneModel } from './model';
import type { Stage } from './stage';

/** Runs `task` after the load event, once the browser is idle. */
function afterLoad(task: () => void): void {
  const idle = () => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(task, { timeout: 3000 });
    else setTimeout(task, 300);
  };
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}

/**
 * Starts the 3D station of the home page at the level the device allows (see level.ts), once the page has loaded:
 * three.js comes as a chunk of its own, fetched only then. At the off level nothing is fetched and the page stays as
 * it is. The level and its layout follow the window (resized across 1024px, reduced motion turned on) and the page
 * leaving; a full level that still runs too slowly at its lowest pixel ratio gives way to the lite level.
 */
export function boot(): void {
  const host = document.querySelector<HTMLElement>('[data-s3d]');
  const labels = document.querySelector<HTMLElement>('[data-s3d-labels]');
  const data = host?.dataset.model;
  if (!host || !labels || !data) return;
  const root = document.documentElement;
  const model = JSON.parse(data) as SceneModel;
  const queries: Queries = { off: host.dataset.offQuery ?? '', narrow: host.dataset.narrowQuery ?? '' };
  const netmap = document.querySelector<HTMLElement>('[data-netmap]');
  const pause = netmap?.querySelector<HTMLElement>('[data-netmap-pause]') ?? null;
  // Place of the two layers in the page; the lite level moves them into the hero map, under its pause button.
  const home = { parent: host.parentElement, before: labels.nextSibling };
  let current: Layout | 'off' | null = null;
  let stage: Stage | null = null;
  let run = 0;

  const place = (next: Layout | 'off') => {
    if (next === 'lite' && netmap) {
      netmap.insertBefore(host, pause);
      netmap.insertBefore(labels, pause);
    } else if (home.parent && host.parentElement !== home.parent) {
      home.parent.insertBefore(host, home.before);
      home.parent.insertBefore(labels, home.before);
    }
  };

  const stop = () => {
    run += 1;
    stage?.stop();
    stage = null;
  };

  // Back to the page as it is: the SVG map, no layout change.
  const off = () => {
    stop();
    current = 'off';
    delete root.dataset.scene3d;
    place('off');
  };

  const apply = () => {
    const detected = detectLevel(queries);
    const level = detected === 'lite' && !netmap ? 'off' : detected;
    const next: Layout | 'off' = level === 'full' ? (isNarrow(queries) ? 'narrow' : 'wide') : level;
    if (next === current) return;
    if (next === 'off') {
      off();
      return;
    }
    stop();
    current = next;
    root.dataset.scene3d = next === 'lite' ? 'lite' : 'full';
    place(next);
    const ticket = run;
    import('./stage')
      .then(({ startStage }) => {
        if (ticket !== run) return;
        stage = startStage({ layout: next, host, labels, model, netmap, pause, onLost: off, onSlow: slow });
      })
      .catch(() => {
        if (ticket === run) off();
      });
  };

  // The full level is still too slow at its lowest pixel ratio: the lite level for the rest of the session.
  const slow = () => {
    markSlow();
    apply();
  };

  afterLoad(() => {
    apply();
    watchLevel(queries, apply);
  });
  // Leaving the page frees the GPU; coming back from the back/forward cache starts again.
  addEventListener('pagehide', () => {
    stop();
    current = null;
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) apply();
  });
}
