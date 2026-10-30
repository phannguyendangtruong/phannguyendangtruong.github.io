/**
 * Run level of the 3D station: 'full' draws it behind the whole home page, 'lite' only in the hero map box, 'off'
 * leaves the page as it is (the SVG map). Kept free of three.js: it decides whether three.js is fetched at all.
 */
export type Level = 'full' | 'lite' | 'off';

/**
 * Layout of a running scene: the full level on a window from 1024px wide ('wide', platform panels beside the shots)
 * or on a narrower one ('narrow', glass cards stacked over the scene), or the lite level in the hero map box.
 */
export type Layout = 'wide' | 'narrow' | 'lite';

/** Media queries of the levels, written once in Station3D.astro and read from its data attributes. */
export type Queries = {
  /** Matches when the scene must not run at all (reduced motion). */
  off: string;
  /** Matches when the full level takes its narrow layout (a window under 1024px wide). */
  narrow: string;
};

/** Key in sessionStorage set once the full level ran too slowly: the rest of the session takes the lite level. */
const slowKey = 's3d-lite';

/** A device with less memory (GB) or fewer cores than this takes the lite level; Station3D.astro tests the same. */
const minMemory = 4;
const minCores = 4;

type Connection = { saveData?: boolean };
type DeviceNavigator = Navigator & { connection?: Connection; deviceMemory?: number };

function saveData(): boolean {
  const connection = (navigator as DeviceNavigator).connection;
  return connection?.saveData === true;
}

/** Less memory or fewer cores than the full level needs, where the browser tells them. */
function weakDevice(): boolean {
  const { deviceMemory, hardwareConcurrency } = navigator as DeviceNavigator;
  const memory = deviceMemory !== undefined && deviceMemory > 0 && deviceMemory < minMemory;
  return memory || (hardwareConcurrency > 0 && hardwareConcurrency < minCores);
}

let slowHere = false;

/** True once the full level ran too slowly in this session (in this page when sessionStorage is blocked). */
function ranSlow(): boolean {
  if (slowHere) return true;
  try {
    return sessionStorage.getItem(slowKey) === '1';
  } catch (_) {
    return false;
  }
}

/** Remembers for the rest of the session that the full level runs too slowly on this device. */
export function markSlow(): void {
  slowHere = true;
  try {
    sessionStorage.setItem(slowKey, '1');
  } catch (_) {
    // Storage blocked: remembered for this page only.
  }
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

/**
 * Level the device allows now: off with reduced motion, Save-Data or no WebGL 2; lite on a weak device or once the
 * full level ran too slowly in this session; full otherwise, whatever the window size and the pointer.
 */
export function detectLevel(queries: Queries): Level {
  if (!queries.off || !queries.narrow || matchMedia(queries.off).matches || saveData() || !hasWebGL2()) return 'off';
  return weakDevice() || ranSlow() ? 'lite' : 'full';
}

/** True while the full level takes its narrow layout. */
export function isNarrow(queries: Queries): boolean {
  return matchMedia(queries.narrow).matches;
}

/** Calls `change` whenever one of the level queries flips (window resized across 1024px, reduced motion turned on). */
export function watchLevel(queries: Queries, change: () => void): void {
  [queries.off, queries.narrow].forEach((query) => {
    if (query) matchMedia(query).addEventListener('change', change);
  });
}
