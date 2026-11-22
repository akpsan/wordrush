/** Public API of the WordRush engine. Import from here, never from internal files. */

export type * from './types';
export { STANDARD_RULES, HEX_RULES, HEX_TWO_WAY_RULES, rulesFor, type Rules } from './rules';
export { roomOf } from './room';
export { geometryOf, neighbours, DELTA, type Geometry, type Shape } from './geometry';
export { createLexicon, parseWordList, type Lexicon } from './lexicon';
export { toIndex, toRowCol, cellsFor } from './board';
export {
  newGame,
  play,
  replayMoves,
  giveUp,
  isLegal,
  legalMoves,
  countLegalMoves,
  anchorsOf,
  moveContext,
  otherPlayer,
  squares,
  type GameState,
} from './game';
export { placementKey, type MoveContext } from './placements';
export { exitsOf, waysOut, boxedInExplanation, type Exit } from './exits';
export { previewEntry, checkEntry, fitsOnlyBackwards, type Preview, type Problem, type WordCheck } from './entry';
export { playScripted, type ScriptedMove } from './scripted';
export { pickHint, nextReveal, linkIndex } from './hints';
