/**
 * Where words can go. Pure functions over a MoveContext, which holds everything a
 * player's turn depends on. Building the context from a game is game.ts's job.
 */

import { cellsFor, ray, stepOf, toRowCol } from './board';
import type { Lexicon, TrieNode } from './lexicon';
import type { Anchor, AnchorMode, Board, CellIndex, Dir, Placement } from './types';

export interface MoveContext {
  readonly board: Board;
  readonly size: number;
  readonly minLen: number;
  /** Maximum word length for this turn (shorter on Blue's first move). */
  readonly maxLen: number;
  /** Cells the new word may start or end on, in order along the last word. */
  readonly anchors: readonly Anchor[];
  /** Words already on the board. They can't be played again. */
  readonly played: ReadonlySet<string>;
}

const MODES: readonly AnchorMode[] = ['start', 'end'];
const DIRS: readonly Dir[] = ['across', 'down'];

export const placementKey = (p: Pick<Placement, 'word' | 'row' | 'col' | 'dir'>): string =>
  `${p.word}@${p.row},${p.col},${p.dir}`;

/** Restrict a context to a single anchor cell (the "tap one of your letters" filter). */
export function withAnchorFilter(ctx: MoveContext, cell: CellIndex | null): MoveContext {
  if (cell === null) return ctx;
  return { ...ctx, anchors: ctx.anchors.filter((a) => a.cell === cell) };
}

/**
 * Where `letters` would sit if it started or ended on `anchor`.
 * Checks geometry only: the anchor letter matches (or the anchor is empty, on a first move)
 * and every other cell is on the board and empty. No dictionary check.
 */
function fit(
  ctx: MoveContext,
  letters: string,
  anchor: Anchor,
  mode: AnchorMode,
  dir: Dir,
): Placement | null {
  const offset = mode === 'start' ? 0 : letters.length - 1;
  const { row: aRow, col: aCol } = toRowCol(ctx.size, anchor.cell);
  const row = dir === 'down' ? aRow - offset : aRow;
  const col = dir === 'across' ? aCol - offset : aCol;
  const cells = cellsFor(ctx.size, row, col, dir, letters.length);
  if (!cells) return null;
  const ok = cells.every((cell, k) => {
    const existing = ctx.board[cell];
    if (cell === anchor.cell) return !existing || existing.letter === letters[k];
    return existing === null;
  });
  return ok ? { word: letters, row, col, dir, anchor: anchor.cell, anchorAt: mode } : null;
}

/**
 * Every spot a complete word fits, in a stable order: start-on-letter before end-on-letter,
 * across before down, then anchor order along the last word. Geometry only.
 */
export function placementsForWord(ctx: MoveContext, word: string): Placement[] {
  const w = word.toLowerCase();
  if (w.length < ctx.minLen || w.length > ctx.maxLen) return [];
  const found = new Map<string, Placement>();
  for (const mode of MODES) {
    for (const dir of DIRS) {
      for (const anchor of ctx.anchors) {
        if (!anchor.modes.includes(mode)) continue;
        const p = fit(ctx, w, anchor, mode, dir);
        if (p && !found.has(placementKey(p))) found.set(placementKey(p), p);
      }
    }
  }
  return [...found.values()];
}

/**
 * Preview spots while a word is still being typed. Geometry only, so it never reveals
 * which letter combinations are real words.
 * - Starting on a letter: the typed letters fit, with room to reach the minimum length.
 * - Ending on a letter: only once the typed string is long enough to be a whole word,
 *   or when the end cell is empty (Orange's first word ends in the corner).
 */
export function partialPlacements(ctx: MoveContext, prefix: string): Placement[] {
  const p = prefix.toLowerCase();
  if (!p || p.length > ctx.maxLen) return [];
  const found = new Map<string, Placement>();
  const add = (pl: Placement | null) => {
    if (pl && !found.has(placementKey(pl))) found.set(placementKey(pl), pl);
  };
  for (const mode of MODES) {
    for (const dir of DIRS) {
      for (const anchor of ctx.anchors) {
        if (!anchor.modes.includes(mode)) continue;
        if (mode === 'start') {
          // Need room for at least minLen letters, even if fewer are typed yet.
          const roomy = fit(ctx, p.padEnd(Math.max(p.length, ctx.minLen), '?'), anchor, mode, dir);
          if (roomy) add(fit(ctx, p, anchor, mode, dir));
        } else {
          const anchorEmpty = ctx.board[anchor.cell] === null;
          if (anchorEmpty) {
            const roomy = fit(ctx, p.padStart(Math.max(p.length, ctx.minLen), '?'), anchor, mode, dir);
            if (roomy) add(fit(ctx, p, anchor, mode, dir));
          } else if (p.length >= ctx.minLen) {
            add(fit(ctx, p, anchor, mode, dir));
          }
        }
      }
    }
  }
  return [...found.values()];
}

/** A group of moves sharing a link cell, a mode and a direction: one "way out". */
interface MoveGroup {
  readonly anchor: CellIndex;
  readonly mode: AnchorMode;
  readonly dir: Dir;
  readonly moves: readonly Placement[];
}

/** Walk a trie along `path`, collecting words that fit. Depth = letters matched so far. */
function walk(
  ctx: MoveContext,
  node: TrieNode,
  path: readonly CellIndex[],
  depth: number,
  out: string[],
): void {
  if (depth >= ctx.minLen && node.word && !ctx.played.has(node.word)) out.push(node.word);
  if (depth >= ctx.maxLen || depth >= path.length) return;
  const cell = path[depth]!;
  const existing = ctx.board[cell];
  if (!existing) {
    for (const child of node.children.values()) walk(ctx, child, path, depth + 1, out);
  } else if (depth === 0) {
    // Only the link cell may already hold a letter.
    const child = node.children.get(existing.letter);
    if (child) walk(ctx, child, path, depth + 1, out);
  }
}

function moveGroups(ctx: MoveContext, lex: Lexicon): MoveGroup[] {
  const groups: MoveGroup[] = [];
  for (const anchor of ctx.anchors) {
    for (const dir of DIRS) {
      for (const mode of anchor.modes) {
        const forward = mode === 'start';
        const path = ray(ctx.size, anchor.cell, dir, forward ? 1 : -1, ctx.maxLen);
        const words: string[] = [];
        walk(ctx, forward ? lex.forward : lex.reverse, path, 0, words);
        const step = stepOf(ctx.size, dir);
        const moves = words.map((word): Placement => {
          const start = forward ? anchor.cell : anchor.cell - (word.length - 1) * step;
          const { row, col } = toRowCol(ctx.size, start);
          return { word, row, col, dir, anchor: anchor.cell, anchorAt: mode };
        });
        groups.push({ anchor: anchor.cell, mode, dir, moves });
      }
    }
  }
  return groups;
}

/** Every real-word move available, without duplicates. Empty means boxed in. */
export function allMoves(ctx: MoveContext, lex: Lexicon): Placement[] {
  const found = new Map<string, Placement>();
  for (const g of moveGroups(ctx, lex)) {
    for (const m of g.moves) if (!found.has(placementKey(m))) found.set(placementKey(m), m);
  }
  return [...found.values()];
}

/** True if at least one real word fits. */
export const hasAnyMove = (ctx: MoveContext, lex: Lexicon): boolean =>
  moveGroups(ctx, lex).some((g) => g.moves.length > 0);

/**
 * "Ways out": how many (letter, start-or-end, direction) combinations still allow at
 * least one real word. Reaches 0 exactly when the player is boxed in.
 */
export const waysOut = (ctx: MoveContext, lex: Lexicon): number =>
  moveGroups(ctx, lex).filter((g) => g.moves.length > 0).length;
