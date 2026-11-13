/**
 * Evaluating what the player has typed. Pure: the UI decides how to show each outcome,
 * and the copy deck decides the words.
 */

import { moveContext, type GameState } from './game';
import type { Lexicon } from './lexicon';
import { partialPlacements, placementsForWord, withAnchorFilter, type MoveContext } from './placements';
import type { CellIndex, Placement } from './types';

/** Live feedback while typing. Never reveals whether letters form a real word until ready. */
export type Preview =
  | { readonly kind: 'empty' }
  | { readonly kind: 'partial'; readonly spots: readonly Placement[] }
  | { readonly kind: 'no-spot' }
  | { readonly kind: 'ready'; readonly spots: readonly Placement[] };

/** Why a word can't be played, checked in this order. First match wins. */
export type Problem = 'too-short' | 'already-played' | 'not-a-word' | 'not-your-letter' | 'no-room';

export type WordCheck =
  | { readonly ok: true; readonly spots: readonly Placement[] }
  | { readonly ok: false; readonly problem: Problem };

const contextFor = (state: GameState, filter: CellIndex | null): MoveContext =>
  withAnchorFilter(moveContext(state), filter);

/** What to preview for the typed letters. `filter` limits spots to one tapped letter. */
export function previewEntry(
  state: GameState,
  lex: Lexicon,
  typed: string,
  filter: CellIndex | null = null,
): Preview {
  const word = typed.toLowerCase();
  if (!word) return { kind: 'empty' };
  const ctx = contextFor(state, filter);
  if (word.length >= ctx.minLen && lex.has(word) && !ctx.played.has(word)) {
    const spots = placementsForWord(ctx, word);
    if (spots.length) return { kind: 'ready', spots };
  }
  const spots = partialPlacements(ctx, word);
  return spots.length ? { kind: 'partial', spots } : { kind: 'no-spot' };
}

/** Full check when the player tries to play. */
export function checkEntry(
  state: GameState,
  lex: Lexicon,
  typed: string,
  filter: CellIndex | null = null,
): WordCheck {
  const word = typed.toLowerCase();
  const ctx = contextFor(state, filter);
  if (word.length < ctx.minLen) return { ok: false, problem: 'too-short' };
  if (ctx.played.has(word)) return { ok: false, problem: 'already-played' };
  if (!lex.has(word)) return { ok: false, problem: 'not-a-word' };
  const spots = placementsForWord(ctx, word);
  if (spots.length) return { ok: true, spots };
  return { ok: false, problem: touchesYourLetters(ctx, word) ? 'no-room' : 'not-your-letter' };
}

/** Does the word start or end with one of the player's letters? (Always true on a first move.) */
function touchesYourLetters(ctx: MoveContext, word: string): boolean {
  return ctx.anchors.some((a) => {
    const letter = ctx.board[a.cell]?.letter;
    if (!letter) return true;
    return (
      (a.modes.includes('start') && word.startsWith(letter)) ||
      (a.modes.includes('end') && word.endsWith(letter))
    );
  });
}

/**
 * True when the typed letters have no spot as typed, but would fit read backwards (right to left or
 * upwards). Geometry only, like the preview: it never says whether either string is a real word.
 * Lets the UI explain that words only read left to right or downwards.
 */
export function fitsOnlyBackwards(state: GameState, typed: string): boolean {
  const ctx = moveContext(state);
  const w = typed.toLowerCase();
  if (w.length < ctx.minLen) return false;
  if (placementsForWord(ctx, w).length > 0) return false;
  return placementsForWord(ctx, [...w].reverse().join('')).length > 0;
}
