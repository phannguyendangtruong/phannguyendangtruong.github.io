import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import type { SceneLine, SceneModel } from './model';

function drawing(width: number, height = width): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Cảnh 3D: trình duyệt không vẽ được canvas 2D.');
  return [canvas, context];
}

/** Soft round light, white in the middle and clear at the edge; the material colour tints it. */
export function glowTexture(): CanvasTexture {
  const [canvas, context] = drawing(128);
  const light = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  light.addColorStop(0, 'rgba(255, 255, 255, 1)');
  light.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
  light.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
  light.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = light;
  context.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

/** A puff of cloud: many soft blobs, clear at the edge, the same on every visit. */
export function cloudTexture(): CanvasTexture {
  const [canvas, context] = drawing(256);
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < 70; index += 1) {
    const angle = random() * Math.PI * 2;
    const reach = random() ** 0.7 * 80;
    const x = 128 + Math.cos(angle) * reach;
    const y = 128 + Math.sin(angle) * reach * 0.6;
    const size = 26 + random() * 46;
    const blob = context.createRadialGradient(x, y, 0, x, y, size);
    blob.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    blob.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = blob;
    context.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(canvas);
}

/**
 * Soft noise that tiles without a seam, for the mist over the ground: blurred blobs of many sizes, each drawn again
 * across the edges it overlaps; the same on every visit.
 */
export function mistTexture(): CanvasTexture {
  const size = 256;
  const [canvas, context] = drawing(size);
  context.fillStyle = '#000';
  context.fillRect(0, 0, size, size);
  let seed = 11;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < 160; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const reach = 18 + random() * 60;
    const alpha = 0.05 + random() * 0.12;
    [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]].forEach(([dx, dy]) => {
      const blob = context.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, reach);
      blob.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      blob.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = blob;
      context.fillRect(0, 0, size, size);
    });
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/** Band of lit windows along a car: warm panes with dark pillars between them, the doors narrower. */
export function carWindowTexture(): CanvasTexture {
  const [canvas, context] = drawing(256, 32);
  context.fillStyle = '#000';
  context.fillRect(0, 0, 256, 32);
  for (let index = 0; index < 6; index += 1) {
    const pane = context.createLinearGradient(0, 4, 0, 28);
    pane.addColorStop(0, '#fff3dc');
    pane.addColorStop(1, '#ffc98a');
    context.fillStyle = pane;
    context.fillRect(8 + index * 41, 5, index === 2 || index === 3 ? 30 : 34, 22);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Glass front of the concourse at the end: warm light behind slim mullions, darker towards the floor. */
export function glazingTexture(): CanvasTexture {
  const [canvas, context] = drawing(256, 64);
  const light = context.createLinearGradient(0, 0, 0, 64);
  light.addColorStop(0, '#ffe2b8');
  light.addColorStop(0.7, '#d98a45');
  light.addColorStop(1, '#2a1a10');
  context.fillStyle = light;
  context.fillRect(0, 0, 256, 64);
  context.fillStyle = '#000';
  for (let x = 0; x < 256; x += 32) context.fillRect(x, 0, 3, 64);
  context.fillRect(0, 0, 256, 3);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

/** Font stacks of the holograms: the condensed sign face and the mono face of the page (--font-display, --mono). */
export type SignFonts = { display: string; mono: string };

/**
 * Font stacks of the holograms, once their faces have loaded for the text they write (the Vietnamese subsets come
 * with the text). A face that fails to load leaves the next one of its stack: the holograms are drawn all the same.
 */
export async function loadSignFonts(model: SceneModel): Promise<SignFonts> {
  const style = getComputedStyle(document.documentElement);
  const fonts: SignFonts = {
    display: style.getPropertyValue('--font-display').trim() || 'sans-serif',
    mono: style.getPropertyValue('--mono').trim() || 'monospace',
  };
  const titles = model.lines.map((line) => `${line.number}${line.title}`).join('');
  const subtitles = model.lines.map((line) => line.subtitle).join('');
  try {
    await Promise.all([
      document.fonts.load(`700 120px ${fonts.display}`, titles),
      document.fonts.load(`500 52px ${fonts.mono}`, subtitles),
    ]);
  } catch (_) {
    // The fallback faces of the stacks draw the text.
  }
  return fonts;
}

/**
 * Text of the hologram of a line in white on clear, for the shader to colour: the route number in a ring, the company
 * in capitals and the line and start year under it, each narrowed to fit when it is long.
 */
export function hologramTexture(line: SceneLine, fonts: SignFonts): CanvasTexture {
  const [canvas, context] = drawing(1024, 256);
  const write = (text: string, font: (size: number) => string, size: number, x: number, y: number) => {
    context.font = font(size);
    const room = canvas.width - x - 16;
    const width = context.measureText(text).width;
    if (width > room) context.font = font(Math.floor((size * room) / width));
    context.fillText(text, x, y);
  };
  context.fillStyle = '#fff';
  context.strokeStyle = '#fff';
  context.lineWidth = 12;
  context.beginPath();
  context.arc(110, 128, 74, 0, Math.PI * 2);
  context.stroke();
  context.font = `700 96px ${fonts.display}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(line.number), 110, 134);
  context.textAlign = 'left';
  write(line.title, (size) => `700 ${size}px ${fonts.display}`, 120, 222, 112);
  context.globalAlpha = 0.75;
  write(line.subtitle, (size) => `500 ${size}px ${fonts.mono}`, 52, 226, 206);
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}
