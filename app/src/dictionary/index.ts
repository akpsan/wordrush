/**
 * The game's word list, bundled locally so every key press can be checked instantly.
 * Same file the simulator uses, so the app and the simulations agree on what's a word.
 */

import { createLexicon, parseWordList, type Lexicon } from '../engine';
import everyday from '../../../data/dictionaries/everyday-3to5.txt?raw';

let cached: Lexicon | null = null;

export function getLexicon(): Lexicon {
  cached ??= createLexicon(parseWordList(everyday));
  return cached;
}
