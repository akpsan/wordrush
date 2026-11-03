/**
 * The game's word lists, bundled locally so every key press can be checked instantly.
 *
 * - Playable words: what counts as a word. The full ENABLE list (3 to 5 letters) minus
 *   offensive words (data/dictionaries/blocked.txt). The rules, "ways out" and the
 *   boxed-in check all use this list.
 * - Hint words: everyday words only, so a hint never suggests an obscure word.
 */

import { createLexicon, parseWordList, type Lexicon } from '../engine';
import playable from '../../../data/dictionaries/playable-3to5.txt?raw';
import hints from '../../../data/dictionaries/hints-3to5.txt?raw';

let cachedLexicon: Lexicon | null = null;
let cachedHints: ReadonlySet<string> | null = null;

export function getLexicon(): Lexicon {
  cachedLexicon ??= createLexicon(parseWordList(playable));
  return cachedLexicon;
}

export function getHintWords(): ReadonlySet<string> {
  cachedHints ??= new Set(parseWordList(hints).map((w) => w.trim()).filter(Boolean));
  return cachedHints;
}
