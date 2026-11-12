/** Public API of the WordRush engine. Import from here, never from internal files. */

export type * from './types';
export { STANDARD_RULES, HEX_RULES, rulesFor, type Rules } from './rules';
export { geometryOf, DELTA, type Geometry, type Shape } from './geometry';
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
export { placementKey, type MoveContext } from './placements';
export { exitsOf, waysOut, boxedInExplanation, type Exit } from './exits';
export { previewEntry, checkEntry, type Preview, type Problem, type WordCheck } from './entry';
export { playScripted, type ScriptedMove } from './scripted';
export { pickHint, nextReveal, linkIndex } from './hints';
