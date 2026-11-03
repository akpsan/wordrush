/**
 * Hints: pick a word for the player to move that fits and leaves them room, then reveal
 * its letters one at a time. A hint never types or plays the word.
 */

import { legalMoves, moveContext, play, type GameState } from './game';
import { waysOut } from './exits';
import type { Lexicon } from './lexicon';
import type { Placement } from './types';

/** How many candidate words to try before settling. Keeps a hint instant on any device. */
const CANDIDATES = 80;
/** Stop early once a word leaves at least this many ways out. */
const ENOUGH_ROOM = 3;

/**
 * A word that fits, preferring one that leaves the player the most room afterwards
 * (or wins outright by boxing the opponent in). Deterministic for a given position.
 */
export function pickHint(state: GameState, lex: Lexicon): Placement | null {
  if (state.result) return null;
  const mover = state.toMove;
  const moves = legalMoves(state, lex).sort(
    (a, b) => a.word.localeCompare(b.word) || a.row - b.row || a.col - b.col || a.dir.localeCompare(b.dir),
  );
  let best: Placement | null = null;
  let bestRoom = -1;
  for (const move of moves.slice(0, CANDIDATES)) {
    const after = play(state, lex, move);
    if (after.result) {
      if (after.result.winner === mover) return move; // boxes the opponent in
      continue;
    }
    const room = waysOut(moveContext({ ...after, toMove: mover }, mover), lex);
    if (room > bestRoom) {
      best = move;
      bestRoom = room;
    }
    if (room >= ENOUGH_ROOM) break;
  }
  return best ?? moves[0] ?? null;
}

/** Index of the link letter within the hinted word (already known to the player). */
export const linkIndex = (spot: Placement): number => (spot.anchorAt === 'start' ? 0 : spot.word.length - 1);

/**
 * The next letter to reveal: the first one that isn't the link letter and isn't shown yet.
 * Null when everything worth revealing is already shown.
 */
export function nextReveal(spot: Placement, revealed: readonly number[], firstMove: boolean): number | null {
  const link = firstMove ? -1 : linkIndex(spot);
  for (let k = 0; k < spot.word.length; k++) {
    if (k !== link && !revealed.includes(k)) return k;
  }
  return null;
}

