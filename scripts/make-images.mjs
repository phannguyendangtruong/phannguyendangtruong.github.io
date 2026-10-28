// Share images and the touch icon, drawn as HTML pages and captured by headless Chrome over the DevTools protocol:
//   public/og/default-en.png, public/og/default-vi.png  1200×630 (paths from shareImages in src/data/profile.ts)
//   public/apple-touch-icon.png                         180×180, public/favicon.svg on a solid background
// Run it again after changing the name, role, location or main technologies:
//   SITE_URL=https://<your-domain> npm run images
// SITE_URL gives the domain printed at the bottom of the share images (no line without it). CHROME_PATH points to
// Chrome, Chromium or Edge when the browser is not in its usual place. Node strips the types of the imported .ts files.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { heroDiagram, heroFrame, heroLog, termPrompt } from '../src/data/hero.ts';
import { profile, shareImages } from '../src/data/profile.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicDir = join(root, 'public');
const langs = ['en', 'vi'];
const og = { width: 1200, height: 630 };
const icon = { size: 180, inset: 8, file: 'apple-touch-icon.png' };
/** Time limit of each step: Chrome start, page load, one protocol call. */
const timeoutMs = 30000;

/** Right column of the share image: the diagram frame, its inner padding and the diagram width inside it. */
const frame = { width: 440, padding: 18 };
const diagramWidth = frame.width - 2 - frame.padding * 2;
/** Boxes of the diagram: label size (JetBrains Mono advances 0.6em), height, inner and outer spacing. */
const box = { font: 15, height: 40, padX: 10, gap: 24, rowStep: 82 };

/** Font subsets of the site, in the order of the @fontsource-variable CSS (the last matching one is tried first). */
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
const families = [
  { family: 'Inter Variable', pkg: 'inter', weight: '100 900' },
  { family: 'JetBrains Mono Variable', pkg: 'jetbrains-mono', weight: '100 800' },
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
    .flatMap(({ family, pkg, weight }) =>
      subsets.map(({ name, range }) => {
        const file = join(root, 'node_modules', '@fontsource-variable', pkg, 'files', `${pkg}-${name}-wght-normal.woff2`);
        if (!existsSync(file)) throw new Error(`Font file not found: ${relative(root, file)}. Run "npm install" first.`);
        const src = `url("${pathToFileURL(file).href}") format('woff2-variations')`;
        return `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; src: ${src}; unicode-range: ${range}; }`;
      }),
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
      await document.fonts.load('800 92px "Inter Variable"', text);
      await document.fonts.load('500 20px "JetBrains Mono Variable"', text);
      await document.fonts.ready;
    } catch (_) {
      throw new Error('The font files could not be loaded.');
    }
    const loaded = (name) => [...document.fonts].some((face) => face.family.includes(name) && face.status === 'loaded');
    if (!loaded('Inter') || !loaded('JetBrains Mono')) throw new Error('The font files could not be loaded.');
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

/** Hero diagram drawn again for the image: same rows and order as on the page, boxes sized for larger labels. */
function diagramSvg(width) {
  const charWidth = box.font * 0.6;
  const scale = width / heroDiagram.width;
  const rows = [...new Set(heroDiagram.nodes.map((item) => item.y))].sort((a, b) => a - b);
  const placed = new Map();
  rows.forEach((rowY, row) => {
    let right = -Infinity;
    const line = heroDiagram.nodes
      .filter((item) => item.y === rowY)
      .sort((a, b) => a.x - b.x)
      .map((item) => {
        const w = Math.ceil(item.id.length * charWidth + box.padX * 2);
        const x = Math.max((item.x + item.w / 2) * scale - w / 2, right + box.gap);
        right = x + w;
        return { ...item, x, y: row * box.rowStep + 1, w };
      });
    // Keep the row inside the drawing: right if it starts before the edge, otherwise left if it ends past it.
    const offset = line[0].x < 1 ? 1 - line[0].x : Math.min(0, width - 1 - right);
    line.forEach((item) => placed.set(item.id, { ...item, x: item.x + offset }));
  });
  const height = (rows.length - 1) * box.rowStep + box.height + 2;
  const middle = (item) => round(item.x + item.w / 2);
  const links = heroDiagram.edges.flatMap(({ from, to }) => {
    const a = placed.get(from);
    const b = placed.get(to);
    if (!a || !b) return [];
    if (a.y === b.y) {
      const y = a.y + box.height / 2;
      return [{ d: `M${round(a.x + a.w)} ${y}H${round(b.x)}`, dot: [round((a.x + a.w + b.x) / 2), y] }];
    }
    const top = a.y + box.height;
    const bend = (top + b.y) / 2;
    const d = `M${middle(a)} ${top}C${middle(a)} ${bend} ${middle(b)} ${bend} ${middle(b)} ${b.y}`;
    return [{ d, dot: [round((middle(a) + middle(b)) / 2), bend] }];
  });
  const nodes = [...placed.values()].map((item) => {
    const broker = item.kind === 'broker';
    const rect = `<rect x="${round(item.x)}" y="${item.y}" width="${item.w}" height="${box.height}" rx="${broker ? box.height / 2 : 9}"/>`;
    const label = `<text x="${middle(item)}" y="${item.y + box.height / 2}">${escapeHtml(item.id)}</text>`;
    return `<g${broker ? ' class="broker"' : ''}>${rect}${label}</g>`;
  });
  return [
    `<svg class="diagram" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `<g class="edges">${links.map((link) => `<path d="${link.d}"/>`).join('')}</g>`,
    nodes.join(''),
    links.map((link) => `<circle cx="${link.dot[0]}" cy="${link.dot[1]}" r="4.5"/>`).join(''),
    '</svg>',
  ].join('');
}

/** Terminal lines of the hero, with the cursor after the last one. */
function terminalHtml() {
  return heroLog
    .map((line, index) => {
      const parts = line
        .map((part) => (part.tone ? `<b class="t-${part.tone}">${escapeHtml(part.text)}</b>` : escapeHtml(part.text)))
        .join('');
      const cursor = index === heroLog.length - 1 ? '<span class="cursor"></span>' : '';
      return `<div class="term-line"><span class="tp">${escapeHtml(termPrompt)}</span> ${parts}${cursor}</div>`;
    })
    .join('');
}

/** Share image layout, in the style of the home page hero; 64px safe margin on every side. */
const ogCss = `
* { box-sizing: border-box; }
html, body { width: ${og.width}px; height: ${og.height}px; margin: 0; overflow: hidden; }
body { position: relative; background: var(--bg); color: var(--text); font-family: var(--font); }
.bg { position: absolute; inset: 0; overflow: hidden; }
.light { position: absolute; border-radius: 50%; filter: blur(110px); }
.light-a { left: -180px; top: -240px; width: 680px; height: 680px; background: var(--accent); opacity: 0.34; }
.light-b { right: -200px; bottom: -280px; width: 720px; height: 720px; background: var(--accent-3); opacity: 0.28; }
.grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse 85% 95% at 35% 30%, #000 40%, transparent 100%);
  mask-image: radial-gradient(ellipse 85% 95% at 35% 30%, #000 40%, transparent 100%);
}
.edge {
  position: absolute; inset: 20px; padding: 1.5px; border-radius: 24px; background: var(--grad); opacity: 0.55;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.card {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr) ${frame.width}px; gap: 40px;
  align-items: center; height: 100%; padding: 64px;
}
.intro { min-width: 0; }
.eyebrow { display: flex; align-items: center; gap: 12px; margin: 0; font: 500 19px/1.4 var(--mono); letter-spacing: 0.01em; color: var(--muted); }
.eyebrow::before { content: ''; flex: none; width: 28px; height: 2px; background: var(--grad); }
.name { margin: 22px 0 0; font-size: 92px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.06; text-wrap: balance; }
.grad { padding: 0.04em 0; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
.chips { display: flex; flex-wrap: wrap; gap: 12px; margin: 34px 0 0; padding: 0; list-style: none; }
.chips li {
  padding: 10px 16px; border: 1px solid var(--chip-border); border-radius: var(--radius-pill);
  background: var(--chip-bg); color: var(--text); font: 500 20px/1 var(--mono);
}
.domain { position: absolute; left: 64px; bottom: 60px; margin: 0; font: 500 20px/1 var(--mono); letter-spacing: 0.02em; color: var(--faint); }
.frame {
  position: relative; overflow: hidden; border: 1px solid var(--border-strong); border-radius: var(--radius-lg);
  background: var(--glass); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: var(--shadow-frame);
}
.frame::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--grad); opacity: 0.8; }
.frame-bar { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 16px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
.dots { display: flex; gap: 7px; }
.dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--border-strong); }
.frame-label { font: 14px/1.4 var(--mono); color: var(--muted); }
.frame-body {
  padding: ${frame.padding}px;
  background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 22px 22px;
}
.diagram { display: block; overflow: visible; }
.diagram path { fill: none; stroke: var(--muted); stroke-opacity: 0.5; stroke-width: 1.6; }
.diagram rect { fill: var(--surface); stroke: var(--muted); stroke-opacity: 0.45; }
.diagram .broker rect { stroke: var(--accent-2); stroke-opacity: 1; stroke-width: 1.4; }
.diagram text { font: 500 ${box.font}px var(--mono); fill: var(--text); text-anchor: middle; dominant-baseline: central; }
.diagram circle { fill: var(--accent-2); filter: drop-shadow(0 0 5px var(--accent-2)); }
.term {
  margin-top: 18px; padding: 12px 14px; border: 1px solid var(--border-strong); border-radius: 10px;
  background: var(--term-bg); color: var(--term-text); font: 14px/1.7 var(--mono);
}
.term-line { overflow: hidden; white-space: pre; text-overflow: ellipsis; }
.tp { color: var(--term-muted); }
.t-ok, .t-event { font-weight: 500; }
.t-ok { color: var(--term-ok); }
.t-event { color: var(--term-event); }
.cursor { display: inline-block; width: 0.55em; height: 1.1em; margin-left: 3px; vertical-align: -0.18em; background: var(--term-event); opacity: 0.85; }
`;

/** Share image of one language: role and location, name, main technologies, domain; the hero diagram on the right. */
function ogHtml(lang, head) {
  const chips = profile.coreTech.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
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
<div class="bg"><span class="light light-a"></span><span class="light light-b"></span><span class="grid"></span><span class="edge"></span></div>
<div class="card">
  <div class="intro">
    <p class="eyebrow"><span>${escapeHtml(profile.role[lang])} · ${escapeHtml(profile.location[lang])}</span></p>
    <h1 class="name"><span class="grad">${escapeHtml(profile.name[lang])}</span></h1>
    <ul class="chips">${chips}</ul>
  </div>
  <div class="frame">
    <div class="frame-bar"><span class="dots"><i></i><i></i><i></i></span><span class="frame-label">${escapeHtml(heroFrame.label[lang])}</span></div>
    <div class="frame-body">${diagramSvg(diagramWidth)}<div class="term">${terminalHtml()}</div></div>
  </div>
  ${domain ? `<p class="domain">${escapeHtml(domain)}</p>` : ''}
</div>
</body>
</html>`;
}

/** Touch icon: the favicon on the page background, a little inside the edge so the rounded mask of iOS keeps its border. */
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
