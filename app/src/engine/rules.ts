import type { Shape } from './geometry';
import type { Player } from './types';

/**
 * Rule settings. A rule change should be a change here, not new branches in the engine.
 * Mirrors the simulator's CURRENT preset (sim/src/wordrush_sim/engine/rules.py, Rules v4).
 */
export interface Rules {
  /** Board is size x size. */
  /** Width of the cell array. On a hex board, 2R + 1 for a hexagon of radius R. */
  readonly size: number;
  readonly shape: Shape;
  readonly minLen: number;
  readonly maxLen: number;
  /** Maximum length of the first player's first word (first-player handicap). */
  readonly firstWordMaxLen: number;
  /** Who wins if the board fills with equal squares. */
  readonly fullBoardTieWinner: Player;
}

export const STANDARD_RULES: Rules = {
  size: 8,
  shape: 'square',
  minLen: 3,
  maxLen: 5,
  firstWordMaxLen: 4,
  fullBoardTieWinner: 1,
};

/** Hex mode (sim preset HEX, see docs/findings.md): a hexagon of radius 5, and Blue's first word at most 3 letters. */
export const HEX_RULES: Rules = { ...STANDARD_RULES, size: 11, shape: 'hex', firstWordMaxLen: 3 };

/** The rules for a board shape. */
export const rulesFor = (shape: Shape): Rules => (shape === 'hex' ? HEX_RULES : STANDARD_RULES);
