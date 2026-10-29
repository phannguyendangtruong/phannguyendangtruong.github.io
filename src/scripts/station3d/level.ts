/**
 * Run level of the 3D station: 'full' draws it behind the whole home page, 'lite' only in the hero map box, 'off'
 * leaves the page as it is (the SVG map). Kept free of three.js: it decides whether three.js is fetched at all.
 */
export type Level = 'full' | 'lite' | 'off';

/** Media queries of the levels, written once in Station3D.astro and read from its data attributes. */
export type Queries = {
  /** Matches when the scene must not run at all (reduced motion). */
  off: string;
  /** Matches when the full level fits: a wide window and a mouse. */
  full: string;
};

type Connection = { saveData?: boolean };

function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return connection?.saveData === true;
}

let webgl: boolean | undefined;

/** WebGL 2 on a real GPU (no software fallback); tested once, the test context is dropped at once. */
function hasWebGL2(): boolean {
  if (webgl !== undefined) return webgl;
  try {
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    webgl = gl !== null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch (_) {
    webgl = false;
  }
  return webgl;
}

/** Level the device allows now: off with reduced motion, Save-Data or no WebGL 2; full on a wide window with a mouse. */
export function detectLevel(queries: Queries): Level {
  if (!queries.full || matchMedia(queries.off).matches || saveData() || !hasWebGL2()) return 'off';
  return matchMedia(queries.full).matches ? 'full' : 'lite';
}

/** Calls `change` whenever one of the level queries flips (window resized across 1024px, reduced motion turned on). */
export function watchLevel(queries: Queries, change: () => void): void {
  [queries.off, queries.full].forEach((query) => {
    if (query) matchMedia(query).addEventListener('change', change);
  });
}
