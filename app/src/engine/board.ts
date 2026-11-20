/** Board geometry and pure board updates. */

import { DELTA, onBoard, type Geometry } from './geometry';
import type { Board, Cell, CellIndex, Dir, Player } from './types';

export const emptyBoard = (g: Geometry): Board => Array<Cell | null>(g.size * g.size).fill(null);

export const toIndex = (size: number, row: number, col: number): CellIndex => row * size + col;

export const toRowCol = (size: number, index: CellIndex): { row: number; col: number } => ({
  row: Math.floor(index / size),
  col: index % size,
});

/** Distance between consecutive letters of a word in this direction. */
export const stepOf = (g: Geometry, dir: Dir): number => DELTA[dir][0] * g.size + DELTA[dir][1];

/** Cells covered by a word, or null if it would leave the board. */
export function cellsFor(g: Geometry, row: number, col: number, dir: Dir, length: number): CellIndex[] | null {
  const [dr, dc] = DELTA[dir];
  const cells: CellIndex[] = [];
  for (let k = 0; k < length; k++) {
    const r = row + k * dr;
    const c = col + k * dc;
    if (!onBoard(g, r, c)) return null;
    cells.push(r * g.size + c);
  }
  return cells;
}

/** Cells reachable from `from` (inclusive), moving forward or backward along `dir`, up to `max` cells. */
export function ray(g: Geometry, from: CellIndex, dir: Dir, direction: 1 | -1, max: number): CellIndex[] {
  const [dr, dc] = DELTA[dir];
  let { row, col } = toRowCol(g.size, from);
  const out: CellIndex[] = [];
  while (out.length < max && onBoard(g, row, col)) {
    out.push(row * g.size + col);
    row += dr * direction;
    col += dc * direction;
  }
  return out;
}

/** Write a word onto the board. Existing cells keep their owner and gain the word reference. */
export function writeWord(
  board: Board,
  cells: readonly CellIndex[],
  word: string,
  player: Player,
  wordIndex: number,
): Board {
  const next = board.slice();
  cells.forEach((cell, k) => {
    const existing = next[cell];
    next[cell] = existing
      ? { ...existing, words: [...existing.words, wordIndex] }
      : { letter: word[k]!, owner: player, words: [wordIndex] };
  });
  return next;
}

/** Every on-board cell holds a letter. */
export const isFull = (board: Board, g: Geometry): boolean => board.every((c, i) => c !== null || !g.valid[i]);

export function squaresOwned(board: Board, player: Player): number {
  return board.reduce((n, c) => (c && c.owner === player ? n + 1 : n), 0);
}
