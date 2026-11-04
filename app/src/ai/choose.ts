/**
 * The AI opponents: one move picker per difficulty. Pure apart from the seeded `rng`.
 *
 * - Easy (Pip): short, everyday words. Usually keeps room for itself, but about 1 move in 4
 *   it plays any short word without looking.
 * - Medium (Juno): the simulator's "defensive" bot: the move that leaves it the most room.
 * - Hard (Rex): the simulator's "lookahead" bot: for its best few moves, assumes your best
 *   reply, and plays for its room minus yours. Takes a box-in whenever it sees one.
 *
 * All three prefer everyday words (the hint list) and use the full list only when no everyday
 * word fits, so they never lose to a gap in their vocabulary and never show off obscure words.
 */

import {
  cellsFor,
  exitsOf,
  legalMoves,
  moveContext,
  play,
  type GameState,
  type Lexicon,
  type Placement,
  type Player,
} from '../engine';
import { evaluate, evaluateMyTurn, gain, WIN, type Weights } from './evaluate';
import { pick, sample, type Rng } from './random';

export type Level = 'easy' | 'medium' | 'hard';

export const LEVELS: readonly Level[] = ['easy', 'medium', 'hard'];

export interface AiContext {
  readonly lex: Lexicon;
  /** Everyday words: what the AI plays when one fits. */
  readonly familiar: ReadonlySet<string>;
  readonly rng: Rng;
  /**
   * Hard's thinking budget: when this returns true, it stops looking further and plays the best
   * move found so far. Omit for unlimited time (tests and calibration, which must be repeatable).
   */
  readonly outOfTime?: () => boolean;
}

/** The AI's move for the player to move, or null if it has none (the game is already over then). */
export function chooseMove(level: Level, state: GameState, ctx: AiContext): Placement | null {
  if (state.result) return null;
  const all = legalMoves(state, ctx.lex);
  if (all.length === 0) return null;
  const everyday = all.filter((m) => ctx.familiar.has(m.word));
  const moves = everyday.length > 0 ? everyday : all;
  switch (level) {
    case 'easy':
      return easy(state, moves, ctx);
    case 'medium':
      return ranked(state, moves, ctx, MEDIUM, 60)[0]!.move;
    case 'hard':
      return hard(state, moves, ctx);
  }
}

const EASY: Weights = { own: 1, opp: 0 };
const MEDIUM: Weights = { own: 3, opp: 0 };
const HARD: Weights = { own: 2, opp: 2 };
const EASY_CARELESS = 0.25;

function easy(state: GameState, moves: Placement[], ctx: AiContext): Placement {
  const shortest = Math.min(...moves.map((m) => m.word.length));
  const short = moves.filter((m) => m.word.length <= Math.max(shortest, 4));
  if (ctx.rng() < EASY_CARELESS) return pick(short, ctx.rng);
  return ranked(state, short, ctx, EASY, 12)[0]!.move;
}

function hard(state: GameState, moves: Placement[], ctx: AiContext): Placement {
  const me = state.toMove;
  const win = boxInMove(state, ctx.lex);
  if (win) return win;
  let best: Placement | null = null;
  let bestValue = -Infinity;
  for (const { move, value: firstValue } of ranked(state, moves, ctx, HARD, 60).slice(0, 6)) {
    const after = play(state, ctx.lex, move);
    let value = firstValue;
    if (!after.result) {
      const replies = legalMoves(after, ctx.lex);
      const reply = ranked(after, replies, ctx, HARD, 30)[0]!.move;
      value = evaluateMyTurn(play(after, ctx.lex, reply), ctx.lex, me, HARD);
    }
    if (value >= WIN) return move;
    if (value > bestValue) {
      best = move;
      bestValue = value;
    }
    if (ctx.outOfTime?.()) break;
  }
  return best!;
}

/**
 * A move that boxes the opponent in right now, if there is one (any real word counts here).
 * To close an exit a word must take one of its squares, so only moves touching every one of the
 * opponent's live exits are tried. (Taking the only word that fits elsewhere is not looked for.)
 */
function boxInMove(state: GameState, lex: Lexicon): Placement | null {
  const me = state.toMove;
  const opp: Player = me === 0 ? 1 : 0;
  if (state.lastWord[opp] === null) return null;
  const live = exitsOf(moveContext(state, opp), lex).filter((e) => e.words > 0);
  const n = state.rules.size;
  const touchesAll = (m: Placement) => {
    const cells = new Set(cellsFor(n, m.row, m.col, m.dir, m.word.length) ?? []);
    return live.every((e) => e.cells.some((c) => cells.has(c)));
  };
  return legalMoves(state, lex).filter(touchesAll).find((m) => play(state, lex, m).result?.winner === me) ?? null;
}

interface Scored {
  readonly move: Placement;
  readonly value: number;
  readonly tie: number;
}

/** One-ply: try each candidate and score the result, best first. */
function ranked(state: GameState, moves: readonly Placement[], ctx: AiContext, w: Weights, cap: number): Scored[] {
  const me: Player = state.toMove;
  return candidates(state, moves, ctx.rng, cap)
    .map((move) => ({ move, value: evaluate(play(state, ctx.lex, move), ctx.lex, me, w), tie: ctx.rng() }))
    .sort((a, b) => b.value - a.value || b.tie - a.tie);
}

/**
 * Limit the moves to evaluate: the ones that claim the most squares, a random sample of the
 * rest, and, for a first word on a board with letters, moves next to them (so a wall is found).
 */
export function candidates(state: GameState, moves: readonly Placement[], rng: Rng, cap: number): Placement[] {
  if (moves.length <= cap) return [...moves];
  const third = Math.floor(cap / 3);
  const key = (m: Placement) => `${m.word}@${m.row},${m.col},${m.dir}`;
  const picked = new Map<string, Placement>();
  [...moves].sort((a, b) => gain(state, b) - gain(state, a)).slice(0, third).forEach((m) => picked.set(key(m), m));
  sample(nearMoves(state, moves), third, rng).forEach((m) => picked.set(key(m), m));
  while (picked.size < cap) {
    const m = pick(moves, rng);
    picked.set(key(m), m);
  }
  return [...picked.values()];
}

function nearMoves(state: GameState, moves: readonly Placement[]): Placement[] {
  if (state.lastWord[state.toMove] !== null) return []; // chained moves already touch letters
  const n = state.rules.size;
  const near = new Set<number>();
  state.board.forEach((cell, i) => {
    if (!cell) return;
    const r = Math.floor(i / n);
    const c = i % n;
    if (r > 0) near.add(i - n);
    if (r < n - 1) near.add(i + n);
    if (c > 0) near.add(i - 1);
    if (c < n - 1) near.add(i + 1);
  });
  if (near.size === 0) return [];
  return moves.filter((m) => {
    const step = m.dir === 'across' ? 1 : n;
    const start = m.row * n + m.col;
    return Array.from({ length: m.word.length }, (_, k) => start + k * step).some((c) => near.has(c));
  });
}
