import { MathUtils } from 'three';

/** Box in the window, in CSS pixels. */
export type Box = { left: number; top: number; right: number; bottom: number };

/**
 * Platform panels of the full level: the blocks of the home page after the hero, set out over the scene by the same
 * selector in Station3D.astro. Each shot is framed in the room its panel leaves, and labels fade out before they
 * reach a panel.
 */
const panelSelector = 'main > section.section > .container';

/** The look point of a shot stays at least this share of the window width away from either edge. */
const edge = 0.2;

/** Room beside a panel, as a share of the window width, under which a shot stays in the middle of the window. */
const minRoom = 0.3;

/**
 * Where a shot is drawn beside a panel: `frame`, the point of the window its look point is drawn at, as a share of the
 * window width from the left; `room`, the width the panel leaves on that side, as a share of the window width (1 when
 * the shot has the whole window).
 */
export type Framing = { frame: number; room: number };

/** Panel of the block `element` belongs to, or null when that block is not a platform panel (the hero). */
export function panelOf(element: HTMLElement): HTMLElement | null {
  const panel = element.closest('section')?.querySelector<HTMLElement>(':scope > .container') ?? null;
  return panel?.matches(panelSelector) ? panel : null;
}

/**
 * Framing of a shot beside `panel`: its look point in the middle of the room the panel leaves on its open side, kept
 * 20% away from the window edges; the middle of the whole window without a panel, or when the panel leaves too little
 * room. The panels line up with the page container, so the room narrows as the window widens past it.
 */
export function frameBeside(panel: HTMLElement | null, width: number): Framing {
  const whole: Framing = { frame: 0.5, room: 1 };
  if (!panel) return whole;
  const box = panel.getBoundingClientRect();
  const left = box.left;
  const right = width - box.right;
  const room = Math.max(left, right);
  if (room < width * minRoom) return whole;
  const middle = right >= left ? (box.right + width) / 2 : left / 2;
  return { frame: MathUtils.clamp(middle / width, edge, 1 - edge), room: room / width };
}

/** Boxes of the panels on the page, measured again whenever the page changes size and read at the current scroll. */
export class Panels {
  private boxes: Box[] = [];

  measure(): void {
    this.boxes = Array.from(document.querySelectorAll<HTMLElement>(panelSelector), (panel) => {
      const box = panel.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top + scrollY, bottom: box.bottom + scrollY };
    });
  }

  /** Window boxes of the panels on screen now. */
  inView(): Box[] {
    const bottom = scrollY + innerHeight;
    return this.boxes
      .filter((box) => box.bottom > scrollY && box.top < bottom)
      .map((box) => ({ left: box.left, right: box.right, top: box.top - scrollY, bottom: box.bottom - scrollY }));
  }
}
