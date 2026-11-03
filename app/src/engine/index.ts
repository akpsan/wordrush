/** Public API of the WordRush engine. Import from here, never from internal files. */

export type * from './types';
export { STANDARD_RULES, type Rules } from './rules';
export { createLexicon, parseWordList, type Lexicon } from './lexicon';
export { toIndex, toRowCol, cellsFor } from './board';
export {
  newGame,
  play,
  giveUp,
  isLegal,
  legalMoves,
  anchorsOf,
  moveContext,
  otherPlayer,
  squares,
  type GameState,
} from './game';
export { waysOut, placementKey, type MoveContext } from './placements';
export { previewEntry, checkEntry, type Preview, type Problem, type WordCheck } from './entry';
