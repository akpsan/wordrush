/** Where each cell of a hex board sits, shared by the game board and the menu's hero board. */

import type { CSSProperties } from 'react';
import type { Geometry } from '../../../engine';

/** Hex boards: a pointy-top hexagon is 2/sqrt(3) as tall as it is wide; rows sit 3/4 of that apart. */
const HEX_H = 2 / Math.sqrt(3);
const ROW_STEP = HEX_H * 0.75;
const SLOT = 0.94;

/** Positions for a hex board's cells, as percentages of the board (see board.css, .board.hex). */
export function hexLayout(geo: Geometry) {
  const n = geo.size;
  const R = (n - 1) / 2;
  const W = n;
  const H = HEX_H + 2 * R * ROW_STEP;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const place = (index: number, size: number, tall: number): CSSProperties => {
    const r = Math.floor(index / n);
    const x = (2 * (index % n) + r - R) / 2; // left edge of the slot, in cell widths (axial q + r/2 + R)
    return {
      left: pct(x + (1 - size) / 2, W),
      top: pct(r * ROW_STEP + (HEX_H - tall) / 2, H),
      width: pct(size, W),
      height: pct(tall, H),
    };
  };
  return {
    style: { '--W': W, '--H': H, aspectRatio: `${W} / ${H}` } as CSSProperties,
    /** The hexagon for cell i: the slot (its fill) and the cell above it (letter and rings) share it. */
    slot: (i: number) => place(i, SLOT, SLOT * HEX_H),
  };
}
