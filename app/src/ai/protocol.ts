/** Messages between the game and the AI worker. Games travel as move lists and are replayed on arrival. */

import { newGame, play, rulesFor, type Dir, type Shape, type GameState, type Lexicon, type Placement } from '../engine';
import type { Level } from './choose';

export interface MoveRecord {
  readonly word: string;
  readonly row: number;
  readonly col: number;
  readonly dir: Dir;
}

export interface AiRequest {
  readonly level: Level;
  readonly moves: readonly MoveRecord[];
  readonly seed: number;
  readonly shape: Shape;
}

export interface WorkerRequest extends AiRequest {
  readonly id: number;
}

export interface WorkerResponse {
  readonly id: number;
  readonly move: Placement | null;
}

export const toRecords = (game: GameState): MoveRecord[] =>
  game.words.map(({ word, row, col, dir }) => ({ word, row, col, dir }));

/** Rebuild a game from its moves. The engine checks every move, so a bad list throws. */
export const replay = (moves: readonly MoveRecord[], lex: Lexicon, shape: Shape = 'square'): GameState =>
  moves.reduce((g, m) => play(g, lex, { ...m, anchor: 0, anchorAt: 'start' }), newGame(rulesFor(shape)));
