/**
 * Public API of the AI layer. Pure: depends only on the engine. The game feature runs it in a
 * Web Worker (worker.ts) so the screen never freezes while the AI thinks.
 */

export { chooseMove, LEVELS, type AiContext, type Level } from './choose';
export { createRng, type Rng } from './random';
export { askAi, type AiRequest } from './client';
export { toRecords, type MoveRecord } from './protocol';
