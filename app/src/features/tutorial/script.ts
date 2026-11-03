/**
 * Learn to play, as data: one entry per step. The runner (lesson.ts) turns this into screens.
 * Every move here is checked by the engine tests (engine/__tests__/engine.test.ts).
 */

import type { CopyId } from '../../copy';
import type { Dir, ScriptedMove } from '../../engine';

export interface Spot {
  readonly row: number;
  readonly col: number;
  readonly dir: Dir;
}

export type Step =
  | { readonly kind: 'intro'; readonly tag: CopyId; readonly coach: CopyId }
  | {
      readonly kind: 'type';
      readonly tag: CopyId;
      readonly coach: CopyId;
      readonly word: string;
      /** The scripted spot. Play only works once the preview is on it. */
      readonly spot: Spot;
      readonly empty: CopyId;
      readonly ready: CopyId;
      /** Shown when the word is complete but on another spot. */
      readonly flip: CopyId;
      readonly note?: CopyId;
      /** The board this step starts from. */
      readonly board: 'chain' | 'boxIn';
    }
  | { readonly kind: 'watch'; readonly tag: CopyId; readonly coach: CopyId; readonly move: ScriptedMove }
  | {
      readonly kind: 'bump';
      readonly tag: CopyId;
      readonly coach: CopyId;
      readonly word: string;
      /** Where the word tries to go: it runs into a letter, so it can't be played. */
      readonly attempt: Spot;
      readonly empty: CopyId;
      readonly bumpCoach: CopyId;
      readonly bumpLine: CopyId;
    }
  | { readonly kind: 'done'; readonly tag: CopyId; readonly coach: CopyId };

/** The game the tutorial builds, move by move (steps 2 to 6). */
export const CHAIN: readonly ScriptedMove[] = [
  { word: 'team', dir: 'across' },
  { word: 'dog', dir: 'down' },
  { word: 'map', dir: 'down' },
  { word: 'big', dir: 'across' },
  { word: 'top', dir: 'across' },
];

/**
 * The position for the last lesson. DOGS is against the right edge, with MAPLE above and
 * STAR below; PLANT closes the left side. Every gap left is one square, so DOGS is boxed in
 * under any dictionary (verified against the full playable list).
 */
export const BOX_IN: readonly ScriptedMove[] = [
  { word: 'team', dir: 'across' },
  { word: 'star', dir: 'down' },
  { word: 'maple', dir: 'across' },
  { word: 'dogs', dir: 'down' },
];

/** The lesson's winning word. */
export const BOX_IN_WORD: ScriptedMove = { word: 'plant', dir: 'down' };

export const STEPS: readonly Step[] = [
  { kind: 'intro', tag: 'learn.1.tag', coach: 'learn.1.coach' },
  {
    kind: 'type',
    tag: 'learn.2.tag',
    coach: 'learn.2.coach',
    word: 'team',
    spot: { row: 0, col: 0, dir: 'across' },
    empty: 'learn.2.empty',
    ready: 'learn.2.ready',
    flip: 'learn.flip.generic',
    note: 'learn.2.note',
    board: 'chain',
  },
  { kind: 'watch', tag: 'learn.3.tag', coach: 'learn.3.coach', move: CHAIN[1]! },
  {
    kind: 'type',
    tag: 'learn.4.tag',
    coach: 'learn.4.coach',
    word: 'map',
    spot: { row: 0, col: 3, dir: 'down' },
    empty: 'learn.4.empty',
    ready: 'learn.4.ready',
    flip: 'learn.4.flip',
    board: 'chain',
  },
  { kind: 'watch', tag: 'learn.5.tag', coach: 'learn.5.coach', move: CHAIN[3]! },
  {
    kind: 'type',
    tag: 'learn.6.tag',
    coach: 'learn.6.coach',
    word: 'top',
    spot: { row: 2, col: 1, dir: 'across' },
    empty: 'learn.4.empty',
    ready: 'learn.6.ready',
    flip: 'learn.flip.generic',
    board: 'chain',
  },
  {
    kind: 'bump',
    tag: 'learn.7.tag',
    coach: 'learn.7.coach',
    word: 'cat',
    attempt: { row: 0, col: 1, dir: 'down' },
    empty: 'learn.7.empty',
    bumpCoach: 'learn.7.bump.coach',
    bumpLine: 'learn.7.bump.line',
  },
  {
    kind: 'type',
    tag: 'learn.8.tag',
    coach: 'learn.8.coach',
    word: 'plant',
    spot: { row: 0, col: 5, dir: 'down' },
    empty: 'learn.4.empty',
    ready: 'learn.8.ready',
    flip: 'learn.flip.generic',
    board: 'boxIn',
  },
  { kind: 'done', tag: 'learn.9.tag', coach: 'learn.9.coach' },
];
