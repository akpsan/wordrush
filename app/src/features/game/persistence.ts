/**
 * The game in progress, saved on the device so Continue can restore it.
 * Only the move list, hint usage and who's playing are stored. Loading replays the moves through the
 * engine, so a damaged or out-of-date save can never produce an illegal board: it's discarded.
 */

import { newGame, play, rulesFor, type Dir, type Shape, type GameState, type Lexicon } from '../../engine';
import { load, remove, save } from '../../platform/storage';
import { LEVELS } from '../../ai';
import { FRIEND, type Match } from './model/match';
import { noHints, type Hints } from './model/session';

const KEY = 'game';

interface SavedMove {
  readonly word: string;
  readonly row: number;
  readonly col: number;
  readonly dir: Dir;
}

/** Version 1 games were always pass and play; version 2 adds `match`. */
interface SavedGame {
  readonly version: 1 | 2;
  readonly moves: readonly SavedMove[];
  readonly hints?: { readonly perGame: number; readonly used: readonly [number, number] };
  readonly match?: Match;
  /** Board shape. Missing in saves from before hex mode: square. */
  readonly shape?: Shape;
}

/** A restored game, ready to continue. */
export interface SavedSession {
  readonly game: GameState;
  readonly hints: Hints;
  readonly match: Match;
}

/** Save a game in progress. A finished game is cleared instead: there's nothing to continue. */
export function saveGame(game: GameState, hints: Hints, match: Match): void {
  if (game.result || game.words.length === 0) {
    remove(KEY);
    return;
  }
  const saved: SavedGame = {
    version: 2,
    moves: game.words.map(({ word, row, col, dir }) => ({ word, row, col, dir })),
    hints: { perGame: hints.perGame, used: hints.used },
    match,
    shape: game.rules.shape,
  };
  save(KEY, saved);
}

export const clearSavedGame = (): void => remove(KEY);

const validCount = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 9;

/** Accept only a well-formed match; anything else (or a version 1 save) is pass and play. */
function readMatch(raw: unknown): Match | null {
  if (raw === undefined) return FRIEND;
  const m = raw as Partial<Record<string, unknown>> | null;
  if (m?.mode === 'friend') return FRIEND;
  if (
    m?.mode === 'ai' &&
    LEVELS.includes(m.level as never) &&
    (m.human === 0 || m.human === 1) &&
    (m.first === 'you' || m.first === 'ai' || m.first === 'random') &&
    typeof m.seed === 'number'
  ) {
    return m as Match;
  }
  return null;
}

export function loadSavedGame(lex: Lexicon): SavedSession | null {
  const saved = load<SavedGame | null>(KEY, null);
  if (!saved || (saved.version !== 1 && saved.version !== 2) || !Array.isArray(saved.moves)) return null;
  const match = readMatch(saved.match);
  if (!match) return null;
  try {
    let game = newGame(rulesFor(saved.shape === 'hex' ? 'hex' : 'square'));
    for (const m of saved.moves) {
      game = play(game, lex, { ...m, anchor: 0, anchorAt: 'start' });
    }
    if (game.result) return null;
    const h = saved.hints;
    const hints =
      h && validCount(h.perGame) && Array.isArray(h.used) && h.used.every(validCount)
        ? noHints(h.perGame, [Math.min(h.used[0], h.perGame), Math.min(h.used[1], h.perGame)])
        : noHints();
    return { game, hints, match };
  } catch {
    clearSavedGame();
    return null;
  }
}
