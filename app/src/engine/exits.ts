/**
 * The four ways out of each letter of a player's last word (right, left, down, up), and
 * whether any real word fits along each. Drives the "ways out" meter, the escape-route dots,
 * and the boxed-in explanation (which letters are in the way, which spaces are too small).
 */

import { ray } from './board';
import type { Lexicon } from './lexicon';
import { allMoves, type MoveContext } from './placements';
import type { AnchorMode, CellIndex, Dir } from './types';

export interface Exit {
  readonly anchor: CellIndex;
  readonly mode: AnchorMode;
  readonly dir: Dir;
  /** Empty cells a word could use, nearest to the anchor first (up to maxLen - 1). */
  readonly cells: readonly CellIndex[];
  /** The occupied cell that stops this exit, or null if the board edge or the length limit does. */
  readonly blocker: CellIndex | null;
  /** How many real words fit along this exit. */
  readonly words: number;
}

/** Every exit from the player's letters (or from their starting corner, before their first word). */
export function exitsOf(ctx: MoveContext, lex: Lexicon): Exit[] {
  const moves = allMoves(ctx, lex);
  const out: Exit[] = [];
  for (const anchor of ctx.anchors) {
    // On a first move the anchor is an empty corner, and the word may use it.
    const anchorEmpty = !ctx.board[anchor.cell];
    for (const dir of ctx.geo.dirs) {
      for (const mode of anchor.modes) {
        const path = ray(ctx.geo, anchor.cell, dir, mode === 'start' ? 1 : -1, ctx.maxLen).slice(anchorEmpty ? 0 : 1);
        const cells: CellIndex[] = [];
        let blocker: CellIndex | null = null;
        for (const cell of path) {
          if (ctx.board[cell]) {
            blocker = cell;
            break;
          }
          cells.push(cell);
        }
        const words = moves.filter((m) => m.anchor === anchor.cell && m.dir === dir && m.anchorAt === mode).length;
        out.push({ anchor: anchor.cell, mode, dir, cells, blocker, words });
      }
    }
  }
  return out;
}

/**
 * "Ways out": how many exits still allow at least one real word. Reaches 0 exactly when the
 * player is boxed in.
 */
export const waysOut = (ctx: MoveContext, lex: Lexicon): number =>
  exitsOf(ctx, lex).filter((e) => e.words > 0).length;

/** Why a word is boxed in: the letters in the way, and the empty spaces too small (or with no word) to use. */
export function boxedInExplanation(exits: readonly Exit[], ownCells: readonly CellIndex[]) {
  const own = new Set(ownCells);
  const inTheWay = new Set<CellIndex>();
  const tooSmall = new Set<CellIndex>();
  for (const e of exits) {
    if (e.words > 0) continue;
    e.cells.forEach((c) => tooSmall.add(c));
    if (e.blocker !== null && !own.has(e.blocker)) inTheWay.add(e.blocker);
  }
  return { inTheWay, tooSmall };
}
