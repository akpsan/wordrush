/**
 * Board shapes, mirroring sim/src/wordrush_sim/engine/geometry.py. Cells are always indexed
 * row * size + col in a size x size array.
 *
 * - 'square': every cell is on the board; words run across or down.
 * - 'hex': a hexagon of radius R = (size - 1) / 2 in axial coordinates (q = col - R, r = row - R),
 *   drawn pointy-top with each row shifted half a cell. Cells with |q + r| > R are off the board.
 *   Words run across, down (down-right on screen) or down-left, so every word reads left to right
 *   or downwards. Blue starts in the hexagon's top-left corner, Orange ends in its bottom-right.
 *   With two-way words (Rules.twoWay, sim preset HEX2) words may also read backwards: left, up
 *   (up-left on screen) or up-right, in the simulator's order H, V, D, h, v, d.
 */

import type { CellIndex, Dir } from './types';

export type Shape = 'square' | 'hex';

export interface Geometry {
  readonly size: number;
  readonly shape: Shape;
  readonly twoWay: boolean;
  /** valid[i] is true when cell i is on the board. */
  readonly valid: readonly boolean[];
  /** Line directions, in the simulator's order (H, V, D, then h, v, d with two-way words). */
  readonly dirs: readonly Dir[];
  /** Blue's first word starts here; Orange's ends here. */
  readonly blueCorner: CellIndex;
  readonly orangeCorner: CellIndex;
  /** Number of cells on the board. */
  readonly cells: number;
}

/** Row and column change for one step along each direction. */
export const DELTA: Readonly<Record<Dir, readonly [number, number]>> = {
  across: [0, 1],
  down: [1, 0],
  downLeft: [1, -1],
  left: [0, -1],
  up: [-1, 0],
  upRight: [-1, 1],
};


const cache = new Map<string, Geometry>();

export function geometryOf(rules: { readonly size: number; readonly shape: Shape; readonly twoWay?: boolean }): Geometry {
  const twoWay = rules.twoWay ?? false;
  const key = `${rules.shape}:${rules.size}:${twoWay}`;
  let g = cache.get(key);
  if (!g) {
    g = build(rules.shape, rules.size, twoWay);
    cache.set(key, g);
  }
  return g;
}

function build(shape: Shape, size: number, twoWay: boolean): Geometry {
  if (shape === 'square') {
    if (twoWay) throw new Error('Two-way words are only defined for hex boards');
    const valid = Array<boolean>(size * size).fill(true);
    return { size, shape, twoWay, valid, dirs: ['across', 'down'], blueCorner: 0, orangeCorner: size * size - 1, cells: size * size };
  }
  if (size % 2 === 0) throw new Error('A hex board needs an odd size (2R + 1)');
  const R = (size - 1) / 2;
  const valid = Array.from({ length: size * size }, (_, i) => {
    const s = Math.floor(i / size) + (i % size);
    return s >= R && s <= 3 * R;
  });
  return {
    size,
    shape,
    twoWay,
    valid,
    dirs: twoWay ? ['across', 'down', 'downLeft', 'left', 'up', 'upRight'] : ['across', 'down', 'downLeft'],
    blueCorner: R,
    orangeCorner: 2 * R * size + R,
    cells: valid.filter(Boolean).length,
  };
}

/** True if (row, col) is on the board. */
export const onBoard = (g: Geometry, row: number, col: number): boolean =>
  row >= 0 && col >= 0 && row < g.size && col < g.size && g.valid[row * g.size + col]!;
