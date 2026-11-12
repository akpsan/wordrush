/** Game state and the pure transitions between states. */

import { emptyBoard, isFull, squaresOwned, writeWord, cellsFor } from './board';
import type { Lexicon } from './lexicon';
import { allMoves, hasAnyMove, placementKey, placementsForWord, type MoveContext } from './placements';
import { geometryOf } from './geometry';
import { STANDARD_RULES, type Rules } from './rules';
import type { Anchor, Board, GameResult, Placement, PlayedWord, Player } from './types';

export interface GameState {
  readonly rules: Rules;
  readonly board: Board;
  /** Every word played, in order. Also the move log that saved games are restored from. */
  readonly words: readonly PlayedWord[];
  /** Index into `words` of each player's last word, or null before their first word. */
  readonly lastWord: readonly [number | null, number | null];
  readonly toMove: Player;
  /** 1-based, counting both players' moves. */
  readonly turn: number;
  readonly result: GameResult | null;
}

export const otherPlayer = (p: Player): Player => (p === 0 ? 1 : 0);

export function newGame(rules: Rules = STANDARD_RULES): GameState {
  return {
    rules,
    board: emptyBoard(geometryOf(rules)),
    words: [],
    lastWord: [null, null],
    toMove: 0,
    turn: 1,
    result: null,
  };
}

/** The cells a player may build from this turn. */
export function anchorsOf(state: GameState, player: Player): Anchor[] {
  const last = state.lastWord[player];
  if (last === null) {
    // First word: Blue starts in the top-left corner, Orange ends in the bottom-right.
    const g = geometryOf(state.rules);
    return player === 0 ? [{ cell: g.blueCorner, modes: ['start'] }] : [{ cell: g.orangeCorner, modes: ['end'] }];
  }
  return state.words[last]!.cells.map((cell) => ({ cell, modes: ['start', 'end'] }));
}

export function moveContext(state: GameState, player: Player = state.toMove): MoveContext {
  const { rules } = state;
  const firstWordForBlue = player === 0 && state.lastWord[0] === null;
  return {
    board: state.board,
    geo: geometryOf(rules),
    minLen: rules.minLen,
    maxLen: firstWordForBlue ? Math.min(rules.maxLen, rules.firstWordMaxLen) : rules.maxLen,
    anchors: anchorsOf(state, player),
    played: new Set(state.words.map((w) => w.word)),
  };
}

/** Every real-word move for a player. */
export const legalMoves = (state: GameState, lex: Lexicon, player: Player = state.toMove) =>
  allMoves(moveContext(state, player), lex);

/** True if the placement is a real, unplayed word in a legal spot for the player to move. */
export function isLegal(state: GameState, lex: Lexicon, p: Placement): boolean {
  if (state.result) return false;
  const ctx = moveContext(state);
  if (!lex.has(p.word) || ctx.played.has(p.word)) return false;
  const key = placementKey(p);
  return placementsForWord(ctx, p.word).some((q) => placementKey(q) === key);
}

/**
 * Play a word. Throws on an illegal move: the UI must check first (see checkWord).
 * After the move: a full board ends the game on squares; otherwise, if the next
 * player has no move, they're boxed in and the mover wins.
 */
export function play(state: GameState, lex: Lexicon, p: Placement): GameState {
  if (!isLegal(state, lex, p)) throw new Error(`Illegal move: ${placementKey(p)}`);
  const { rules } = state;
  const mover = state.toMove;
  const cells = cellsFor(geometryOf(rules), p.row, p.col, p.dir, p.word.length)!;
  const index = state.words.length;
  const played: PlayedWord = {
    word: p.word, row: p.row, col: p.col, dir: p.dir, player: mover, turn: state.turn, cells,
  };
  const lastWord: [number | null, number | null] = [...state.lastWord];
  lastWord[mover] = index;
  const next: GameState = {
    ...state,
    board: writeWord(state.board, cells, p.word, mover, index),
    words: [...state.words, played],
    lastWord,
    toMove: otherPlayer(mover),
    turn: state.turn + 1,
  };
  return { ...next, result: resultAfterMove(next, lex, mover) };
}

function resultAfterMove(state: GameState, lex: Lexicon, mover: Player): GameResult | null {
  if (isFull(state.board, geometryOf(state.rules))) {
    const a = squaresOwned(state.board, 0);
    const b = squaresOwned(state.board, 1);
    const winner: Player = a === b ? state.rules.fullBoardTieWinner : a > b ? 0 : 1;
    return { winner, reason: 'full-board' };
  }
  const opponent = otherPlayer(mover);
  if (!hasAnyMove(moveContext(state, opponent), lex)) {
    return { winner: mover, reason: 'boxed-in', boxedWord: state.lastWord[opponent] ?? undefined };
  }
  return null;
}

/** The player to move gives up. Only allowed on their own turn. */
export function giveUp(state: GameState): GameState {
  if (state.result) return state;
  return { ...state, result: { winner: otherPlayer(state.toMove), reason: 'gave-up' } };
}

export const squares = (state: GameState, player: Player): number => squaresOwned(state.board, player);
