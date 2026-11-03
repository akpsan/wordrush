import type { Player } from './types';

/**
 * Rule settings. A rule change should be a change here, not new branches in the engine.
 * Mirrors the simulator's CURRENT preset (sim/src/wordrush_sim/engine/rules.py, Rules v4).
 */
export interface Rules {
  /** Board is size x size. */
  readonly size: number;
  readonly minLen: number;
  readonly maxLen: number;
  /** Maximum length of the first player's first word (first-player handicap). */
  readonly firstWordMaxLen: number;
  /** Who wins if the board fills with equal squares. */
  readonly fullBoardTieWinner: Player;
}

export const STANDARD_RULES: Rules = {
  size: 8,
  minLen: 3,
  maxLen: 5,
  firstWordMaxLen: 4,
  fullBoardTieWinner: 1,
};
