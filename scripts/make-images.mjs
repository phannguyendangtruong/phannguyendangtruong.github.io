// Share images and the touch icon, drawn as HTML pages and captured by headless Chrome over the DevTools protocol:
//   public/og/default-en.png, public/og/default-vi.png  1200×630 (paths from shareImages in src/data/profile.ts)
//   public/apple-touch-icon.png                         180×180, public/favicon.svg on a solid background
// Run it again after changing the name, role, location or the jobs:
//   SITE_URL=https://<your-domain> npm run images
// SITE_URL gives the domain printed at the bottom of the share images (no line without it). CHROME_PATH points to
// Chrome, Chromium or Edge when the browser is not in its usual place. Node strips the types of the imported .ts files.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { experience, monthIndex, profile, shareImages } from '../src/data/profile.ts';
import { ui } from '../src/i18n/ui.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicDir = join(root, 'public');
const langs = ['en', 'vi'];
const og = { width: 1200, height: 630 };
const icon = { size: 180, inset: 8, file: 'apple-touch-icon.png' };
/** Time limit of each step: Chrome start, page load, one protocol call. */
const timeoutMs = 30000;

/**
 * Network map on the right of the share image, in px: route bullets at the top, one branch per job that turns at 45°
 * into a shared trunk, and the end capsule at the bottom. `lineCount` is the number of --line-* colour tokens.
 */
const map = {
  width: 400,
  height: 502,
  bulletY: 30,
  bullet: 22,
  bend: 120,
  spread: 110,
  gap: 18,
  endY: 400,
  endR: 13,
  station: 8,
  lineCount: 3,
};

/** Font subsets of the site, in the order of the @fontsource CSS (the last matching one is tried first). */
const subsets = [
  {
    name: 'vietnamese',
    range:
      'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
  },
  {
    name: 'latin-ext',
    range:
      'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  },
  {
    name: 'latin',
    range:
      'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  },
];
/** Faces used by the images: the role in Barlow 500, the name, bullets and end label in Barlow Condensed 700. */
const families = [
  { family: 'Barlow', pkg: 'barlow', weights: [500] },
  { family: 'Barlow Condensed', pkg: 'barlow-condensed', weights: [700] },
];

/** Domain printed at the bottom of the share images: SITE_URL without its scheme; empty when it is not set. */
const domain = (process.env.SITE_URL ?? '')
  .trim()
  .replace(/^https?:\/\//i, '')
  .replace(/\/+$/, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const round = (value) => Math.round(value * 10) / 10;
const escapeHtml = (value) =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

/** @font-face rules pointing at the woff2 files in node_modules, so the images use the fonts of the site. */
function fontFaces() {
  return families
    .flatMap(({ family, pkg, weights }) =>
      weights.flatMap((weight) =>
        subsets.map(({ name, range }) => {
          const file = join(root, 'node_modules', '@fontsource', pkg, 'files', `${pkg}-${name}-${weight}-normal.woff2`);
          if (!existsSync(file)) throw new Error(`Font file not found: ${relative(root, file)}. Run "npm install" first.`);
          const src = `url("${pathToFileURL(file).href}") format('woff2')`;
          return `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; src: ${src}; unicode-range: ${range}; }`;
        }),
      ),
    )
    .join('\n');
}

/** Dark theme variables of the site (the first :root block of src/styles/global.css), so the colours stay in step. */
function themeVariables() {
  const css = readFileSync(join(root, 'src', 'styles', 'global.css'), 'utf8');
  const block = /:root\s*\{[^}]*\}/.exec(css);
  if (!block) throw new Error('No :root block found in src/styles/global.css.');
  return block[0];
}

/** Browser executable: CHROME_PATH, otherwise the usual places of Chrome, Chromium and Edge on this system. */
function findChrome() {
  const custom = (process.env.CHROME_PATH ?? '').trim();
  if (custom) {
    if (existsSync(custom)) return custom;
    throw new Error(`CHROME_PATH is set to "${custom}", but no file exists there.`);
  }
  const windowsDirs = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
  const candidates =
    {
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ],
      win32: windowsDirs.flatMap((dir) => [
        join(dir, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        join(dir, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ]),
      linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/microsoft-edge',
      ],
    }[process.platform] ?? [];
  const found = candidates.find((file) => existsSync(file));
  if (found) return found;
  throw new Error(
    'Chrome was not found. Install Google Chrome, or set CHROME_PATH to the executable of Chrome, Chromium or Edge.',
  );
}

/** Starts headless Chrome on a free port; `endpoint` resolves with the browser DevTools address printed on stderr. */
function launch(executable, profileDir) {
  const chrome = spawn(
    executable,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-color-profile=srgb',
      // The pages are local files that load the font files of node_modules.
      '--allow-file-access-from-files',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const endpoint = new Promise((resolve, reject) => {
    let output = '';
    let ready = false;
    const timer = setTimeout(() => reject(new Error('Chrome did not start in time.')), timeoutMs);
    chrome.stderr.setEncoding('utf8');
    chrome.stderr.on('data', (chunk) => {
      if (ready) return;
      output += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(output);
      if (!match) return;
      ready = true;
      clearTimeout(timer);
      resolve(match[1]);
    });
    chrome.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(`Chrome could not be started (${executable}): ${error.message}`));
    });
    chrome.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome stopped before it was ready (exit code ${code}).\n${output.trim()}`));
    });
  });
  return { chrome, endpoint };
}

/** Resolves once the process has ended, or after `ms` at most. */
function exited(child, ms) {
  return new Promise((resolve) => {
    if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

/** DevTools protocol client over one WebSocket (Node's built-in); commands for a tab carry its session id. */
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error(`Could not connect to Chrome at ${url}.`)), { once: true });
  });
  let lastId = 0;
  const calls = new Map();
  const waiters = new Set();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id === undefined) {
      waiters.forEach((waiter) => {
        if (waiter.method === message.method && waiter.sessionId === message.sessionId) waiter.resolve(message.params);
      });
      return;
    }
    const call = calls.get(message.id);
    if (!call) return;
    calls.delete(message.id);
    if (message.error) call.reject(new Error(`${call.method}: ${message.error.message}`));
    else call.resolve(message.result);
  });
  socket.addEventListener('close', () => {
    calls.forEach((call) => call.reject(new Error(`${call.method}: Chrome closed the connection.`)));
    calls.clear();
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++lastId;
      const timer = setTimeout(() => {
        calls.delete(id);
        reject(new Error(`${method}: no answer from Chrome in time.`));
      }, timeoutMs);
      const call = {
        method,
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      };
      calls.set(id, call);
      try {
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      } catch (error) {
        calls.delete(id);
        call.reject(error);
      }
    });

  /** Resolves with the params of the next `method` event of the session. */
  const next = (method, sessionId) =>
    new Promise((resolve, reject) => {
      const waiter = {
        method,
        sessionId,
        resolve: (params) => {
          clearTimeout(timer);
          waiters.delete(waiter);
          resolve(params);
        },
      };
      const timer = setTimeout(() => {
        waiters.delete(waiter);
        reject(new Error(`${method}: the page did not load in time.`));
      }, timeoutMs);
      waiters.add(waiter);
    });

  return { send, next, close: () => socket.close() };
}

/** Runs in the page before the capture: the fonts of its text loaded (or an error), the name kept to two lines. */
const settleScript = `(async () => {
  const text = document.body.textContent.trim();
  if (text) {
    try {
      await document.fonts.load('700 112px "Barlow Condensed"', text);
      await document.fonts.load('500 30px "Barlow"', text);
      await document.fonts.ready;
    } catch (_) {
      throw new Error('The font files could not be loaded.');
    }
    const loaded = (name) =>
      [...document.fonts].some((face) => face.family.replace(/["']/g, '') === name && face.status === 'loaded');
    if (!loaded('Barlow') || !loaded('Barlow Condensed')) throw new Error('The font files could not be loaded.');
  }
  const name = document.querySelector('.name');
  if (name) {
    let size = parseFloat(getComputedStyle(name).fontSize);
    while (name.offsetHeight > size * 2.4 && size > 48) {
      size -= 2;
      name.style.fontSize = size + 'px';
    }
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
})()`;

/** Loads `html` from its own file in `workDir`, waits for its fonts and images, then saves a width × height PNG. */
async function capture(cdp, sessionId, { html, width, height, output, workDir }) {
  const page = join(workDir, `${basename(output, '.png')}.html`);
  writeFileSync(page, html);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);
  const loaded = cdp.next('Page.loadEventFired', sessionId);
  const navigation = await cdp.send('Page.navigate', { url: pathToFileURL(page).href }, sessionId);
  if (navigation.errorText) throw new Error(`Page.navigate: ${navigation.errorText}`);
  await loaded;
  const settled = await cdp.send(
    'Runtime.evaluate',
    { expression: settleScript, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (settled.exceptionDetails) {
    const details = settled.exceptionDetails;
    throw new Error((details.exception?.description ?? details.text).split('\n')[0]);
  }
  const shot = await cdp.send(
    'Page.captureScreenshot',
    { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } },
    sessionId,
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, Buffer.from(shot.data, 'base64'));
  console.log(`Wrote ${relative(root, output)} (${width}×${height})`);
}

/** Point at the fraction `share` of the length of a polyline. */
function pointAt(points, share) {
  const lengths = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let left = lengths.reduce((sum, length) => sum + length, 0) * share;
  for (let index = 0; index < lengths.length; index += 1) {
    if (left <= lengths[index] || index === lengths.length - 1) {
      const part = lengths[index] ? Math.min(1, left / lengths[index]) : 0;
      const [x0, y0] = points[index];
      const [x1, y1] = points[index + 1];
      return [round(x0 + (x1 - x0) * part), round(y0 + (y1 - y0) * part)];
    }
    left -= lengths[index];
  }
  return points[points.length - 1];
}

/**
 * Lines of `experience` for the map, oldest job first as on the site (line 1 on the left): the track from the bullet
 * down a branch that turns at 45° into the shared trunk, and one station per project spread along the branch.
 */
function mapLines() {
  const jobs = [...experience].sort((a, b) => monthIndex(a.start) - monthIndex(b.start));
  if (jobs.length > map.lineCount) {
    throw new Error(`The share image has ${map.lineCount} line colours, but experience lists ${jobs.length} companies.`);
  }
  const middle = map.width / 2;
  const outer = (jobs.length - 1) / 2;
  const join = map.bend + outer * (map.spread - map.gap);
  return jobs.map((job, index) => {
    const shift = index - outer;
    const x = middle + shift * map.spread;
    const trunkX = middle + shift * map.gap;
    const branch =
      shift === 0
        ? [[x, map.bulletY], [x, join]]
        : [[x, map.bulletY], [x, map.bend], [trunkX, map.bend + Math.abs(x - trunkX)]];
    const free = [[x, map.bulletY + map.bullet + map.station], ...branch.slice(1)];
    const count = job.projects.length;
    return {
      number: index + 1,
      x,
      trunkX,
      track: [...branch, [trunkX, map.endY]],
      stations: job.projects.map((_, position) => pointAt(free, (position + 0.5) / count)),
    };
  });
}

/** Map of the share image: tracks, stations, the end capsule and its label, then the route bullets on top. */
function mapSvg(lang) {
  const lines = mapLines();
  // Each line carries its colour and the colour of the text on it (the numeral of its bullet).
  const colour = (line) => `style="--line: var(--line-${line.number}); --on-line: var(--on-line-${line.number})"`;
  const path = (points) => points.map(([x, y], index) => `${index ? 'L' : 'M'}${round(x)} ${round(y)}`).join('');
  const tracks = lines.map((line) => `<path class="track" ${colour(line)} d="${path(line.track)}"/>`).join('');
  const stations = lines
    .flatMap((line) =>
      line.stations.map(([x, y]) => `<circle class="station" ${colour(line)} cx="${x}" cy="${y}" r="${map.station}"/>`),
    )
    .join('');
  const left = Math.min(...lines.map((line) => line.trunkX)) - map.endR;
  const right = Math.max(...lines.map((line) => line.trunkX)) + map.endR;
  const end = `<rect class="end" x="${round(left)}" y="${map.endY - map.endR}" width="${round(right - left)}" height="${map.endR * 2}" rx="${map.endR}"/>`;
  const endLabel = escapeHtml(ui.mapNow[lang].toLocaleUpperCase(lang));
  const label = `<text class="end-label" x="${map.width / 2}" y="${map.endY + map.endR + 48}">${endLabel}</text>`;
  const bullets = lines
    .map(
      (line) =>
        `<g class="bullet" ${colour(line)}><circle cx="${round(line.x)}" cy="${map.bulletY}" r="${map.bullet}"/>` +
        `<text x="${round(line.x)}" y="${map.bulletY}">${line.number}</text></g>`,
    )
    .join('');
  return [
    `<svg class="map" viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}" aria-hidden="true">`,
    tracks,
    stations,
    end,
    label,
    bullets,
    '</svg>',
  ].join('');
}

/** Share image layout: flat page background, name and role on the left, the map on the right; 64px safe margin. */
const ogCss = `
* { box-sizing: border-box; }
html, body { width: ${og.width}px; height: ${og.height}px; margin: 0; overflow: hidden; }
body { background: var(--bg); color: var(--text); font-family: var(--font); }
.card {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr) ${map.width}px; gap: 48px;
  align-items: center; height: 100%; padding: 64px;
}
.intro { min-width: 0; }
.name { margin: 0; font: 700 112px/1.05 var(--font-display); letter-spacing: -0.01em; color: var(--text); text-wrap: balance; }
.role { margin: 28px 0 0; font: 500 30px/1.35 var(--font); color: var(--muted); }
.domain { position: absolute; left: 64px; bottom: 56px; margin: 0; font: 500 22px/1 var(--font); color: var(--faint); }
.map { display: block; overflow: visible; }
.track { fill: none; stroke: var(--line); stroke-width: 8; stroke-linejoin: round; }
.station { fill: var(--bg); stroke: var(--line); stroke-width: 4; }
.end { fill: var(--interchange-fill); stroke: var(--interchange-stroke); stroke-width: 3; }
.end-label { font: 700 44px var(--font-display); letter-spacing: 0.04em; fill: var(--text); text-anchor: middle; }
.bullet circle { fill: var(--line); }
.bullet text {
  font: 700 26px var(--font-display); fill: var(--on-line); text-anchor: middle; dominant-baseline: central;
}
`;

/** Share image of one language: name, role and location, domain; the network map on the right. */
function ogHtml(lang, head) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<style>
${head}
${ogCss}
</style>
</head>
<body>
<div class="card">
  <div class="intro">
    <h1 class="name">${escapeHtml(profile.name[lang])}</h1>
    <p class="role">${escapeHtml(profile.role[lang])} · ${escapeHtml(profile.location[lang])}</p>
  </div>
  ${mapSvg(lang)}
  ${domain ? `<p class="domain">${escapeHtml(domain)}</p>` : ''}
</div>
</body>
</html>`;
}

/** Touch icon: the favicon on the page background, a little inside the edge so the rounded mask of iOS keeps it whole. */
function iconHtml(head) {
  const favicon = pathToFileURL(join(publicDir, 'favicon.svg')).href;
  const size = icon.size - icon.inset * 2;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
${head}
html, body { width: ${icon.size}px; height: ${icon.size}px; margin: 0; overflow: hidden; background: var(--bg); }
body { display: grid; place-items: center; }
img { display: block; width: ${size}px; height: ${size}px; }
</style>
</head>
<body><img src="${favicon}" alt=""></body>
</html>`;
}

async function main() {
  if (!existsSync(join(publicDir, 'favicon.svg'))) throw new Error('public/favicon.svg not found.');
  const theme = themeVariables();
  const faces = fontFaces();
  const executable = findChrome();
  const workDir = mkdtempSync(join(tmpdir(), 'site-images-'));
  const { chrome, endpoint } = launch(executable, join(workDir, 'profile'));
  // Chrome is stopped whatever happens: error, Ctrl+C or normal end.
  const stopChrome = () => {
    if (chrome.exitCode === null && chrome.signalCode === null) chrome.kill();
  };
  process.once('exit', stopChrome);
  process.once('SIGINT', () => {
    stopChrome();
    process.exit(130);
  });
  let cdp = null;
  try {
    cdp = await connect(await endpoint);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    for (const lang of langs) {
      const file = shareImages.default[lang] ?? `og/default-${lang}.png`;
      const html = ogHtml(lang, `${faces}\n${theme}`);
      await capture(cdp, sessionId, { html, ...og, output: join(publicDir, file), workDir });
    }
    const output = join(publicDir, icon.file);
    await capture(cdp, sessionId, { html: iconHtml(theme), width: icon.size, height: icon.size, output, workDir });
  } finally {
    if (cdp) {
      await Promise.race([cdp.send('Browser.close').catch(() => {}), sleep(3000)]);
      cdp.close();
    }
    stopChrome();
    await exited(chrome, 5000);
    try {
      rmSync(workDir, { recursive: true, force: true, maxRetries: 3 });
    } catch (_) {
      // A temporary folder still locked by the browser (Windows) is left for the system to clean.
    }
  }
}

try {
  await main();
} catch (error) {
  console.error(`make-images: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
// Ends at once, without waiting for timers of steps that were cut short by an error.
process.exit();
