import { detectLevel, watchLevel, type Level, type Queries } from './level';
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
 * it is. The level follows the window (resized across 1024px, reduced motion turned on) and the page leaving.
 */
export function boot(): void {
  const host = document.querySelector<HTMLElement>('[data-s3d]');
  const labels = document.querySelector<HTMLElement>('[data-s3d-labels]');
  const data = host?.dataset.model;
  if (!host || !labels || !data) return;
  const root = document.documentElement;
  const model = JSON.parse(data) as SceneModel;
  const queries: Queries = { off: host.dataset.offQuery ?? '', full: host.dataset.fullQuery ?? '' };
  const netmap = document.querySelector<HTMLElement>('[data-netmap]');
  const pause = netmap?.querySelector<HTMLElement>('[data-netmap-pause]') ?? null;
  // Place of the two layers in the page; the lite level moves them into the hero map, under its pause button.
  const home = { parent: host.parentElement, before: labels.nextSibling };
  let level: Level | null = null;
  let stage: Stage | null = null;
  let run = 0;

  const place = (next: Level) => {
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
    level = 'off';
    delete root.dataset.scene3d;
    place('off');
  };

  const apply = () => {
    const detected = detectLevel(queries);
    const next: Level = detected === 'lite' && !netmap ? 'off' : detected;
    if (next === level) return;
    if (next === 'off') {
      off();
      return;
    }
    stop();
    level = next;
    root.dataset.scene3d = next;
    place(next);
    const ticket = run;
    import('./stage')
      .then(({ startStage }) => {
        if (ticket !== run) return;
        stage = startStage({ level: next, host, labels, model, netmap, pause, onLost: off });
      })
      .catch(() => {
        if (ticket === run) off();
      });
  };

  afterLoad(() => {
    apply();
    watchLevel(queries, apply);
  });
  // Leaving the page frees the GPU; coming back from the back/forward cache starts again.
  addEventListener('pagehide', () => {
    stop();
    level = null;
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) apply();
  });
}
