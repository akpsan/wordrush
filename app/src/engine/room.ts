/**
 * Room: how many words a player could still play one after another if the opponent never moved
 * again. The opponent's words only ever take cells away, so a player with little room is in a dead
 * end whatever happens next (docs/findings.md, Decided before the end). Counting legal words misses
 * this: a pocket can hold many words that all lead nowhere.
 */

import { hasAnyMove, allMoves, type MoveContext } from './placements';
import { moveContext, play, type GameState } from './game';
import type { Lexicon } from './lexicon';
import type { Player } from './types';

/** Searches deeper than this are cut short and count as open: a warning must never be wrong. */
const DEFAULT_BUDGET = 400;

/**
 * The player's room, up to `horizon` words: 0 if they have no word now, `horizon` if they could chain
 * at least that many. Looks only at the player's own words, alone on the board. Stops after `budget`
 * positions and answers `horizon` then, so a short answer is always a proven one.
 */
export function roomOf(state: GameState, lex: Lexicon, player: Player, horizon = 3, budget = DEFAULT_BUDGET): number {
  let left = budget;
  const solo = (s: GameState): GameState => ({ ...s, toMove: player, result: null });
  const search = (s: GameState, depth: number): number => {
    if (--left < 0) return horizon; // out of budget: assume open
    const ctx: MoveContext = moveContext(s, player);
    if (depth === horizon - 1) return hasAnyMove(ctx, lex) ? 1 : 0;
    // Longest words first: they reach furthest, so open positions show their room quickly.
    const moves = allMoves(ctx, lex).sort((a, b) => b.word.length - a.word.length);
    let best = 0;
    for (const m of moves) {
      best = Math.max(best, 1 + search(solo(play(s, lex, m)), depth + 1));
      if (best >= horizon - depth) break;
    }
    return best;
  };
  return Math.min(horizon, search(solo(state), 0));
}
