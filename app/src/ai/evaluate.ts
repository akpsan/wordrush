/**
 * Scoring positions for the AI, ported from the simulator's bots (sim/src/wordrush_sim/agents/bots.py)
 * so the app's opponents behave like the ones the rules were tested with.
 *
 * Under "boxed in loses", squares only matter if the board fills, so they get a small weight.
 * What matters is room: how many moves each side would have.
 */

import { cellsFor, legalMoves, squares, type GameState, type Lexicon, type Placement, type Player } from '../engine';

export const WIN = 1_000_000;

export interface Weights {
  /** Weight on the AI's own room. */
  readonly own: number;
  /** Weight on the opponent's room (subtracted). */
  readonly opp: number;
}

/** Moves a player would have on this board, or null before their first word. */
export function mobility(state: GameState, lex: Lexicon, player: Player): number | null {
  if (state.lastWord[player] === null) return null;
  return legalMoves(state, lex, player).length;
}

function outcome(state: GameState, me: Player): number {
  return state.result ? (state.result.winner === me ? WIN : -WIN) : 0;
}

/** Every style keeps a minimum weight of 1 on both sides: ignoring either is suicidal under this rule. */
function survivalValue(diff: number, own: number | null, their: number | null, w: Weights): number {
  let value = 0.1 * diff;
  if (own !== null) value += Math.max(w.own, 1) * Math.log1p(own);
  if (their !== null) value -= Math.max(w.opp, 1) * Math.log1p(their);
  return value;
}

/** Score a position from `me`'s point of view, with the opponent to move. */
export function evaluate(state: GameState, lex: Lexicon, me: Player, w: Weights): number {
  if (state.result) return outcome(state, me);
  const opp: Player = me === 0 ? 1 : 0;
  const own = mobility(state, lex, me);
  // The engine ends the game when the player to move has no move, so `their` is never 0 here.
  // If I have none, nothing they do can free me (squares never empty), so I lose.
  if (own === 0) return -WIN;
  return survivalValue(squares(state, me) - squares(state, opp), own, mobility(state, lex, opp), w);
}

/** Score a position where it's `me` to move. */
export function evaluateMyTurn(state: GameState, lex: Lexicon, me: Player, w: Weights): number {
  if (state.result) return outcome(state, me);
  const opp: Player = me === 0 ? 1 : 0;
  const their = mobility(state, lex, opp);
  if (their === 0) return WIN; // I move, and no move of mine can free them
  return survivalValue(squares(state, me) - squares(state, opp), mobility(state, lex, me), their, w);
}

/** New squares a move claims. */
export function gain(state: GameState, p: Placement): number {
  const cells = cellsFor(state.rules.size, p.row, p.col, p.dir, p.word.length) ?? [];
  return cells.filter((c) => !state.board[c]).length;
}
