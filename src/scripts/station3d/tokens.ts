import { Color } from 'three';
import type { SceneLine } from './model';

/** True while the page shows its light theme (html[data-theme='light']); the dark theme is the default. */
export function isDay(): boolean {
  return document.documentElement.dataset.theme === 'light';
}

/**
 * Colours of the lines by route number, read from their CSS tokens (--line-1…) in the theme in use: every other
 * colour of the city is a light or a material, not a page colour. Each line keeps one Color object, read again in
 * place when the theme changes, so the materials and uniforms that hold it follow.
 */
export class LineColors {
  private readonly lines: SceneLine[];
  private readonly colors = new Map<number, Color>();

  constructor(lines: SceneLine[]) {
    this.lines = lines;
    this.read();
  }

  /** Colour of a line; white for a route number with no line. */
  of(number: number): Color {
    let color = this.colors.get(number);
    if (!color) {
      color = new Color(1, 1, 1);
      this.colors.set(number, color);
    }
    return color;
  }

  /** Reads the colours of the theme in use (call it before the parts of the scene repaint for a theme). */
  read(): void {
    const style = getComputedStyle(document.documentElement);
    this.lines.forEach((line) => {
      this.of(line.number).setStyle(style.getPropertyValue(line.token).trim() || '#ffffff');
    });
  }
}
