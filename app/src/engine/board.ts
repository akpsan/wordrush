/** Board geometry and pure board updates. */

import type { Board, Cell, CellIndex, Dir, Player } from './types';

export const emptyBoard = (size: number): Board => Array<Cell | null>(size * size).fill(null);

export const toIndex = (size: number, row: number, col: number): CellIndex => row * size + col;

export const toRowCol = (size: number, index: CellIndex): { row: number; col: number } => ({
  row: Math.floor(index / size),
  col: index % size,
});

/** Distance between consecutive letters of a word in this direction. */
export const stepOf = (size: number, dir: Dir): number => (dir === 'across' ? 1 : size);

/** Cells covered by a word, or null if it would leave the board. */
export function cellsFor(
  size: number,
  row: number,
  col: number,
  dir: Dir,
  length: number,
): CellIndex[] | null {
  if (row < 0 || col < 0) return null;
  const endRow = dir === 'down' ? row + length - 1 : row;
  const endCol = dir === 'across' ? col + length - 1 : col;
  if (endRow >= size || endCol >= size) return null;
  const step = stepOf(size, dir);
  const start = toIndex(size, row, col);
  return Array.from({ length }, (_, k) => start + k * step);
}

/** Cells reachable from `from` (inclusive), moving forward or backward along `dir`, up to `max` cells. */
export function ray(
  size: number,
  from: CellIndex,
  dir: Dir,
  direction: 1 | -1,
  max: number,
): CellIndex[] {
  const { row, col } = toRowCol(size, from);
  const along = dir === 'across' ? col : row;
  const room = direction === 1 ? size - 1 - along : along;
  const step = stepOf(size, dir) * direction;
  return Array.from({ length: Math.min(max, room + 1) }, (_, k) => from + k * step);
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

export const isFull = (board: Board): boolean => board.every((c) => c !== null);

export function squaresOwned(board: Board, player: Player): number {
  return board.reduce((n, c) => (c && c.owner === player ? n + 1 : n), 0);
}
