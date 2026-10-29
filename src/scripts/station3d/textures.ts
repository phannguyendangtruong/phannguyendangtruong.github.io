import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Color } from 'three';

const size = 128;

function drawing(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Cảnh 3D: trình duyệt không vẽ được canvas 2D.');
  return [canvas, context];
}

/** Soft round light, white in the middle and clear at the edge; the material colour tints it. */
export function glowTexture(): CanvasTexture {
  const [canvas, context] = drawing();
  const half = size / 2;
  const light = context.createRadialGradient(half, half, 0, half, half, half);
  light.addColorStop(0, 'rgba(255, 255, 255, 1)');
  light.addColorStop(0.25, 'rgba(255, 255, 255, 0.55)');
  light.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = light;
  context.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/**
 * Ground of the scene: one square a scene unit with a thin line on two sides and a dot at the corner, so the floor
 * carries the dot grid of the page. Painted again from the theme colours when the theme changes.
 */
export class GroundTexture {
  readonly texture: CanvasTexture;
  private readonly context: CanvasRenderingContext2D;

  constructor(repeat: number) {
    const [canvas, context] = drawing();
    this.context = context;
    this.texture = new CanvasTexture(canvas);
    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.texture.repeat.set(repeat, repeat);
    this.texture.anisotropy = 8;
    this.texture.colorSpace = SRGBColorSpace;
  }

  paint(ground: Color, line: Color, dot: Color): void {
    const context = this.context;
    context.fillStyle = ground.getStyle();
    context.fillRect(0, 0, size, size);
    context.fillStyle = line.getStyle();
    context.fillRect(0, 0, size, 2);
    context.fillRect(0, 0, 2, size);
    context.fillStyle = dot.getStyle();
    context.beginPath();
    context.arc(1, 1, 5, 0, Math.PI * 2);
    context.fill();
    this.texture.needsUpdate = true;
  }

  dispose(): void {
    this.texture.dispose();
  }
}
