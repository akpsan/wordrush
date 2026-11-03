/**
 * Build positions from a list of words, played through the real rules. Used wherever the
 * app shows a pre-made position (the menu's animated board, the tutorial), so those
 * positions are always legal.
 */

import { checkEntry } from './entry';
import { newGame, play, type GameState } from './game';
import type { Lexicon } from './lexicon';
import type { AnchorMode, Dir } from './types';

export interface ScriptedMove {
  readonly word: string;
  readonly dir: Dir;
  /** Required only when the word fits both starting and ending on a letter in this direction. */
  readonly at?: AnchorMode;
  /** Required only when several spots still match (e.g. two letters of the same kind). */
  readonly row?: number;
}

/** Play the moves in order. Throws if a move isn't legal, so a broken script fails loudly in tests. */
export function playScripted(lex: Lexicon, moves: readonly ScriptedMove[], from: GameState = newGame()): GameState {
  return moves.reduce((game, m) => {
    const check = checkEntry(game, lex, m.word);
    if (!check.ok) throw new Error(`Scripted move ${m.word}: ${check.problem}`);
    const spot = check.spots.find(
      (s) => s.dir === m.dir && (!m.at || s.anchorAt === m.at) && (m.row === undefined || s.row === m.row),
    );
    if (!spot) throw new Error(`Scripted move ${m.word}: no ${m.dir} spot`);
    return play(game, lex, spot);
  }, from);
}
