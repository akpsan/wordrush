/**
 * A game in progress plus what the player has typed. Pure: a reducer over immutable data,
 * with all rule decisions delegated to the engine.
 */

import {
  checkEntry,
  giveUp,
  newGame,
  nextReveal,
  pickHint,
  play,
  type CellIndex,
  type GameState,
  type Lexicon,
  type Placement,
  type Problem,
} from '../../../engine';
import { entryView } from './entry';

export interface Session {
  readonly game: GameState;
  /** Letters typed this turn, lowercase. */
  readonly typed: string;
  /**
   * The spot the player flipped to, remembered while they edit the word. The preview keeps
   * it as long as the word still fits there, and falls back to the first spot otherwise.
   */
  readonly preferred: SpotChoice | null;
  /** A tapped letter that limits spots to that letter. */
  readonly filter: CellIndex | null;
  /** The last failed attempt to play. `id` changes on every attempt, to replay the shake. */
  readonly problem: { readonly kind: Problem; readonly id: number } | null;
  /** The word just played and how many squares it gained, for the pop and "+n" animations. */
  readonly lastPlay: { readonly wordIndex: number; readonly gain: number } | null;
  /** The player has seen the boxed-in moment and moved on to the results. */
  readonly resultsShown: boolean;
  readonly hints: Hints;
}

/** Hints for this game. Both players get `perGame`; the setting is fixed when the game starts. */
export interface Hints {
  readonly perGame: number;
  readonly used: readonly [number, number];
  /** The hint shown this turn: a word that fits, and which of its letters are revealed. */
  readonly current: { readonly spot: Placement; readonly revealed: readonly number[] } | null;
}

export const noHints = (perGame = 0, used: readonly [number, number] = [0, 0]): Hints => ({ perGame, used, current: null });

export const hintsLeft = (s: Session): number => s.hints.perGame - s.hints.used[s.game.toMove];

/** A spot, independent of the word: which letter it's on, start or end, and direction. */
export interface SpotChoice {
  readonly anchor: CellIndex;
  readonly anchorAt: 'start' | 'end';
  readonly dir: 'across' | 'down';
}

export type SessionAction =
  | { readonly type: 'letter'; readonly letter: string }
  | { readonly type: 'delete' }
  | { readonly type: 'escape' }
  | { readonly type: 'flip' }
  | { readonly type: 'filter'; readonly cell: CellIndex }
  | { readonly type: 'play' }
  | { readonly type: 'giveUp' }
  | { readonly type: 'showResults' }
  | { readonly type: 'hint' }
  | { readonly type: 'newGame' };

export const createSession = (game: GameState = newGame(), hints: Hints = noHints()): Session => ({
  game,
  typed: '',
  preferred: null,
  filter: null,
  problem: null,
  lastPlay: null,
  resultsShown: false,
  hints,
});

/** A fresh turn: everything typed is cleared, the game's hint allowance carries on. */
const nextTurn = (s: Session, game: GameState): Session =>
  createSession(game, { ...s.hints, current: null });

const editing = (s: Session, typed: string, filter = s.filter): Session => ({
  ...s,
  typed,
  filter,
  problem: null,
});

export function sessionReducer(lex: Lexicon, hintWords?: ReadonlySet<string>) {
  return function reduce(s: Session, action: SessionAction): Session {
    const over = s.game.result !== null;
    switch (action.type) {
      case 'letter': {
        if (over || !/^[a-z]$/.test(action.letter)) return s;
        const { maxLen } = entryView(s, lex);
        return s.typed.length >= maxLen ? s : editing(s, s.typed + action.letter);
      }
      case 'delete':
        return over || !s.typed ? s : editing(s, s.typed.slice(0, -1));
      case 'escape':
        if (s.filter !== null) return editing(s, s.typed, null);
        return s.typed ? editing(s, '') : s;
      case 'flip': {
        const { spots, index } = entryView(s, lex);
        if (spots.length < 2) return s;
        const next = spots[(index + 1) % spots.length]!;
        return { ...s, preferred: { anchor: next.anchor, anchorAt: next.anchorAt, dir: next.dir } };
      }
      case 'filter':
        return over ? s : editing(s, s.typed, s.filter === action.cell ? null : action.cell);
      case 'play':
        return over ? s : attemptPlay(s, lex);
      case 'giveUp':
        return over ? s : { ...nextTurn(s, giveUp(s.game)), resultsShown: true };
      case 'showResults':
        return { ...s, resultsShown: true };
      case 'hint':
        return over ? s : revealHint(s, lex, hintWords);
      case 'newGame':
        return createSession(newGame(s.game.rules), noHints(s.hints.perGame));
    }
  };
}

function attemptPlay(s: Session, lex: Lexicon): Session {
  const view = entryView(s, lex);
  if (view.ready && view.current) {
    const spot = view.current;
    const gain = gainOf(s.game, spot.word.length, spot.row, spot.col, spot.dir);
    const game = play(s.game, lex, spot);
    return {
      ...nextTurn(s, game),
      lastPlay: { wordIndex: game.words.length - 1, gain },
    };
  }
  const check = checkEntry(s.game, lex, s.typed, s.filter);
  if (check.ok) return s; // ready but no spot selected: can't happen, nothing to do
  return { ...s, problem: { kind: check.problem, id: (s.problem?.id ?? 0) + 1 } };
}

/** Show a hint, or one more letter of the current hint. Each use counts against the player's allowance. */
function revealHint(s: Session, lex: Lexicon, hintWords?: ReadonlySet<string>): Session {
  if (hintsLeft(s) <= 0) return s;
  const mover = s.game.toMove;
  const firstMove = s.game.lastWord[mover] === null;
  const spot = s.hints.current?.spot ?? pickHint(s.game, lex, hintWords);
  if (!spot) return s;
  const revealed = s.hints.current?.revealed ?? [];
  const next = nextReveal(spot, revealed, firstMove);
  if (next === null) return s; // every letter worth showing is already shown
  const used: [number, number] = [...s.hints.used];
  used[mover] += 1;
  return { ...s, hints: { ...s.hints, used, current: { spot, revealed: [...revealed, next] } } };
}

/** New squares a word would claim (every cell except an existing link letter). */
function gainOf(game: GameState, length: number, row: number, col: number, dir: 'across' | 'down'): number {
  const n = game.rules.size;
  let gain = 0;
  for (let k = 0; k < length; k++) {
    const cell = dir === 'across' ? row * n + col + k : (row + k) * n + col;
    if (!game.board[cell]) gain++;
  }
  return gain;
}
