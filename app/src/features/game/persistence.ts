/**
 * The game in progress, saved on the device so Continue can restore it.
 * Only the move list (and hint usage) is stored. Loading replays the moves through the
 * engine, so a damaged or out-of-date save can never produce an illegal board: it's discarded.
 */

import { newGame, play, type GameState, type Lexicon } from '../../engine';
import { load, remove, save } from '../../platform/storage';
import { noHints, type Hints } from './model/session';

const KEY = 'game';

interface SavedMove {
  readonly word: string;
  readonly row: number;
  readonly col: number;
  readonly dir: 'across' | 'down';
}

interface SavedGame {
  readonly version: 1;
  readonly moves: readonly SavedMove[];
  readonly hints?: { readonly perGame: number; readonly used: readonly [number, number] };
}

/** A restored game, ready to continue. */
export interface SavedSession {
  readonly game: GameState;
  readonly hints: Hints;
}

/** Save a game in progress. A finished game is cleared instead: there's nothing to continue. */
export function saveGame(game: GameState, hints: Hints): void {
  if (game.result || game.words.length === 0) {
    remove(KEY);
    return;
  }
  const saved: SavedGame = {
    version: 1,
    moves: game.words.map(({ word, row, col, dir }) => ({ word, row, col, dir })),
    hints: { perGame: hints.perGame, used: hints.used },
  };
  save(KEY, saved);
}

export const clearSavedGame = (): void => remove(KEY);

const validCount = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 9;

export function loadSavedGame(lex: Lexicon): SavedSession | null {
  const saved = load<SavedGame | null>(KEY, null);
  if (!saved || saved.version !== 1 || !Array.isArray(saved.moves)) return null;
  try {
    let game = newGame();
    for (const m of saved.moves) {
      game = play(game, lex, { ...m, anchor: 0, anchorAt: 'start' });
    }
    if (game.result) return null;
    const h = saved.hints;
    const hints =
      h && validCount(h.perGame) && Array.isArray(h.used) && h.used.every(validCount)
        ? noHints(h.perGame, [Math.min(h.used[0], h.perGame), Math.min(h.used[1], h.perGame)])
        : noHints();
    return { game, hints };
  } catch {
    clearSavedGame();
    return null;
  }
}
