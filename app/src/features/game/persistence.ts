/**
 * The game in progress, saved on the device so Continue can restore it.
 * Only the move list is stored. Loading replays it through the engine, so a damaged or
 * out-of-date save can never produce an illegal board: it's simply discarded.
 */

import { newGame, play, type GameState, type Lexicon } from '../../engine';
import { load, remove, save } from '../../platform/storage';

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
}

/** Save a game in progress. A finished game is cleared instead: there's nothing to continue. */
export function saveGame(game: GameState): void {
  if (game.result || game.words.length === 0) {
    remove(KEY);
    return;
  }
  const saved: SavedGame = {
    version: 1,
    moves: game.words.map(({ word, row, col, dir }) => ({ word, row, col, dir })),
  };
  save(KEY, saved);
}

export const clearSavedGame = (): void => remove(KEY);

export function loadSavedGame(lex: Lexicon): GameState | null {
  const saved = load<SavedGame | null>(KEY, null);
  if (!saved || saved.version !== 1 || !Array.isArray(saved.moves)) return null;
  try {
    let game = newGame();
    for (const m of saved.moves) {
      game = play(game, lex, { ...m, anchor: 0, anchorAt: 'start' });
    }
    return game.result ? null : game;
  } catch {
    clearSavedGame();
    return null;
  }
}
