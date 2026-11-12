/** Core data types for the WordRush engine. Everything here is immutable data. */

/** 0 = Blue (always moves first), 1 = Orange. */
export type Player = 0 | 1;

/** Line directions. 'downLeft' exists on hex boards only (see geometry.ts). */
export type Dir = 'across' | 'down' | 'downLeft';

/** Whether the new word starts or ends on the shared (link) letter. */
export type AnchorMode = 'start' | 'end';

/** A cell index: row * size + col. */
export type CellIndex = number;

export interface Cell {
  readonly letter: string;
  /** The player who placed this letter first. */
  readonly owner: Player;
  /** Indices into GameState.words of every word that uses this cell. */
  readonly words: readonly number[];
}

export type Board = readonly (Cell | null)[];

/** A cell your next word may start or end on. */
export interface Anchor {
  readonly cell: CellIndex;
  readonly modes: readonly AnchorMode[];
}

/** One way to put a word on the board. */
export interface Placement {
  readonly word: string;
  readonly row: number;
  readonly col: number;
  readonly dir: Dir;
  /** The link cell this placement uses. */
  readonly anchor: CellIndex;
  readonly anchorAt: AnchorMode;
}

export interface PlayedWord {
  readonly word: string;
  readonly row: number;
  readonly col: number;
  readonly dir: Dir;
  readonly player: Player;
  readonly turn: number;
  readonly cells: readonly CellIndex[];
}

export type EndReason = 'boxed-in' | 'gave-up' | 'full-board';

export interface GameResult {
  readonly winner: Player;
  readonly reason: EndReason;
  /** The word that got boxed in, when reason is 'boxed-in'. */
  readonly boxedWord?: number;
}
