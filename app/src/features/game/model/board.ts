/**
 * What each board cell shows. Pure: returns plain data (classes, letter, label, tap action);
 * the Board component only renders it. Class names match the design's board.css.
 */

import { plain, playerName, t } from '../../../copy';
import {
  boxedInExplanation,
  exitsOf,
  moveContext,
  toRowCol,
  type CellIndex,
  type Lexicon,
  type Player,
  cellsFor,
  geometryOf,
  legalMoves,
  play,
  type GameState,
  type Dir,
  type Shape,
} from '../../../engine';
import type { EntryView } from './entry';
import type { Session } from './session';
import { wordsFor } from './status';

export interface CellView {
  readonly index: CellIndex;
  readonly letter: string;
  readonly className: string;
  /** The link badge on the shared letter of a ready preview. */
  readonly linkBadge: boolean;
  /** START / END on the first-move corners. */
  readonly mark: string | null;
  /** Animation stagger, in ms. */
  readonly delay: number;
  readonly tap: 'flip' | 'filter' | null;
  readonly label: string;
  /** Reading direction on a previewed letter (→ ↓ ↘ ↙), or null. */
  readonly arrow: string | null;
  /** Heatmap level of an empty cell: how many of the mover's words could pass through it (0 = none or off). */
  readonly heat: HeatLevel;
}

export type HeatLevel = 0 | 1 | 2 | 3;

export interface BoardOptions {
  /** Dots on the remaining exits when a player is down to 1 or 2 ways out. */
  readonly showWaysOut: boolean;
  /** Pulse the mover's letters (default true). The tutorial turns it off while you watch. */
  readonly showAnchors?: boolean;
  /**
   * Fade older words so the latest ones stand out, and dim the rest of the board while typing
   * (default false). Off once the game is over, and in the tutorial, whose lessons point at letters.
   */
  readonly fade?: boolean;
  /**
   * The AI's word appearing: only its new squares pop, this many ms apart. 0 shows them all at once
   * (a tap skips the animation). Omit for a person's word (every letter pops, 60ms apart).
   */
  readonly aiReveal?: number;
  /**
   * Tint empty cells by how many of the mover's playable words pass through them. With a ready word,
   * the tint shows the mover's words after playing it (where they could go next). Default off.
   */
  readonly heat?: boolean;
}

/** Words through each empty cell, for `player` in `game`. */
export function heatCounts(game: GameState, lex: Lexicon, player: Player): Map<CellIndex, number> {
  const counts = new Map<CellIndex, number>();
  if (game.result) return counts;
  const geo = geometryOf(game.rules);
  for (const m of legalMoves(game, lex, player)) {
    for (const c of cellsFor(geo, m.row, m.col, m.dir, m.word.length) ?? []) {
      if (!game.board[c]) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }
  return counts;
}

/** 1 word, 2 to 4, 5 or more. */
const heatLevel = (n: number): HeatLevel => (n === 0 ? 0 : n === 1 ? 1 : n <= 4 ? 2 : 3);

/** How long ago a player played a word: 0 = their last word, 1 = the one before, 2 = older. */
export type WordAge = 0 | 1 | 2;

/**
 * The age of every played word, counted in later words by the same player. A letter shared by
 * two words (a link letter) shows the younger age: see cellAge.
 */
export function wordAges(words: readonly { readonly player: Player }[]): WordAge[] {
  const later = [0, 0];
  const ages: WordAge[] = new Array(words.length);
  for (let i = words.length - 1; i >= 0; i--) {
    const p = words[i]!.player;
    ages[i] = Math.min(later[p]!, 2) as WordAge;
    later[p]!++;
  }
  return ages;
}

const cellAge = (ages: readonly WordAge[], wordsUsingCell: readonly number[]): WordAge =>
  Math.min(...wordsUsingCell.map((w) => ages[w]!)) as WordAge;

const AGE_CLASS = ['', 'prev', 'old'] as const;

const ownerClass = (p: Player) => (p === 0 ? 'a' : 'b');

export function boardView(s: Session, entry: EntryView, lex: Lexicon, opts: BoardOptions): CellView[] {
  const { game } = s;
  const n = game.rules.size;
  const mover = game.toMove;
  const over = game.result !== null;
  const myTurn = !over;
  const firstMove = myTurn && game.lastWord[mover] === null;
  const fullBoardEnd = game.result?.reason === 'full-board';

  // Cells of each player's last word ("recent"), and the mover's letters to build from.
  const recentOf = (p: Player) => new Set(game.lastWord[p] === null ? [] : game.words[game.lastWord[p]!]!.cells);
  const recent: [Set<CellIndex>, Set<CellIndex>] = [recentOf(0), recentOf(1)];
  const showAnchors = opts.showAnchors ?? true;
  const anchors = showAnchors && myTurn && !firstMove ? recent[mover] : new Set<CellIndex>();

  // The previewed spot.
  const ghost = new Map<CellIndex, { letter: string; k: number; link: boolean }>();
  if (entry.current) {
    const c = entry.current;
    (cellsFor(geometryOf(game.rules), c.row, c.col, c.dir, c.word.length) ?? []).forEach((cell, k) => {
      ghost.set(cell, { letter: c.word[k]!, k, link: cell === c.anchor });
    });
  }

  // The most recent word, flashed for the next player until they start typing.
  const lastWord = game.words[game.words.length - 1];
  const flash = new Set(lastWord && !s.typed && !over ? lastWord.cells : []);
  const popCells = s.lastPlay ? game.words[s.lastPlay.wordIndex]!.cells : [];
  const revealing = opts.aiReveal !== undefined;
  const popOrder = revealing ? popCells.filter((c) => game.board[c]!.words.length === 1) : popCells;
  const pop = new Map<CellIndex, number>(popOrder.map((c, k) => [c, k] as const));
  const stagger = revealing ? opts.aiReveal! : 60;

  // Escape-route dots when the mover is running out of room.
  const routes = new Set<CellIndex>();
  if (opts.showWaysOut && myTurn && !firstMove && !s.typed) {
    const ways = wordsFor(game, lex, mover);
    if (ways !== null && ways <= 2) {
      exitsOf(moveContext(game, mover), lex)
        .filter((e) => e.words > 0)
        .forEach((e) => e.cells.forEach((c) => routes.add(c)));
    }
  }

  // Heatmap: where the mover's words can go (after the ready word, if there is one).
  let heat = new Map<CellIndex, number>();
  if (opts.heat && myTurn) {
    let g: GameState = game;
    if (entry.ready && entry.current) {
      try {
        g = play(game, lex, entry.current);
      } catch {
        g = game;
      }
    }
    heat = heatCounts(g, lex, mover);
  }

  // The boxed-in explanation.
  const boxed = game.result?.reason === 'boxed-in' ? game.result : null;
  const loser = boxed ? (boxed.winner === 0 ? 1 : 0) : null;
  const sealed = new Set(boxed && boxed.boxedWord !== undefined ? game.words[boxed.boxedWord]!.cells : []);
  const explain =
    boxed && loser !== null
      ? boxedInExplanation(exitsOf(moveContext(game, loser), lex), [...sealed])
      : { inTheWay: new Set<CellIndex>(), tooSmall: new Set<CellIndex>() };

  // Fading: older words recede at rest; while typing, everything but both last words and the preview dims.
  const fade = (opts.fade ?? false) && !over;
  const ages = fade ? wordAges(game.words) : [];
  const typing = fade && s.typed.length > 0;

  const geo = geometryOf(game.rules);
  const corner = mover === 0 ? geo.blueCorner : geo.orangeCorner;

  return game.board.map((cell, index): CellView => {
    const cls = ['cell'];
    let letter = cell?.letter ?? '';
    let linkBadge = false;
    let mark: string | null = null;
    let arrow: string | null = null;
    let delay = 0;
    let tap: CellView['tap'] = null;

    if (cell) {
      cls.push(ownerClass(cell.owner));
      if (!fullBoardEnd && recent[cell.owner].has(index)) cls.push('recent');
      if (cell.words.length > 1) cls.push(cell.owner === 0 ? 'xa' : 'xb');
      if (fade) {
        const age = cellAge(ages, cell.words);
        if (age > 0) cls.push(AGE_CLASS[age]);
        if (typing && age > 0 && !ghost.has(index)) cls.push('fdim');
      }
    }

    const g = ghost.get(index);
    if (g) {
      delay = g.k * 30;
      tap = 'flip';
      if (!cell) {
        cls.push(entry.ready ? 'gnew' : 'gpart');
        letter = g.letter;
        linkBadge = g.link;
        arrow = arrowOf(entry.current!.dir, geo.shape);
      } else {
        cls.push('gring');
        if (!entry.ready) cls.push('weak');
        linkBadge = entry.ready;
      }
    } else if (anchors.has(index)) {
      tap = 'filter';
      cls.push(s.filter === index ? 'anchor-on' : entry.current ? 'anchor-dim' : 'anchor');
    } else if (explain.inTheWay.has(index)) {
      cls.push('wall');
    } else if (flash.has(index) && lastWord) {
      cls.push('flash', lastWord.player === 0 ? 'fa' : 'fb');
    }

    if (!g && routes.has(index)) cls.push('route');
    if (sealed.has(index)) cls.push('sealed');
    if (!cell && explain.tooSmall.has(index)) cls.push('gap');
    const popAt = pop.get(index);
    if (popAt !== undefined) {
      cls.push('pop');
      delay = popAt * stagger;
    }
    if (showAnchors && firstMove && index === corner && !g) {
      cls.push('start', mover === 0 ? 'sa' : 'sb');
      mark = mover === 0 ? t('board.start') : t('board.end');
    }
    if (showAnchors && firstMove && mover === 0 && index === geo.orangeCorner && !cell && !g) {
      cls.push('endmark');
      mark = t('board.end');
    }

    // With fading on, plain empty squares lose their outline, so a faded tile never reads as empty.
    if (fade && cls.length === 1) cls.push('bare');

    const h = !cell && !g && !mark ? heatLevel(heat.get(index) ?? 0) : 0; // marked corners keep their contrast
    if (h) cls.push(`heat${h}`);
    return { index, letter, className: cls.join(' '), linkBadge, mark, arrow, delay, tap, label: cellLabel(index, n, letter, cell?.owner, !!g), heat: h };
  });
}

function cellLabel(index: number, size: number, letter: string, owner: Player | undefined, preview: boolean): string {
  const { row, col } = toRowCol(size, index);
  const L = letter.toUpperCase();
  const content = preview
    ? plain('cell.aria.preview', { L })
    : owner !== undefined
      ? plain('cell.aria.letter', { L, owner: playerName(owner) })
      : plain('cell.aria.empty');
  return plain('cell.aria', { row: row + 1, col: col + 1, content });
}

/** The reading direction of a previewed word, drawn on its letters. On a hex board "down" runs down-right. */
function arrowOf(dir: Dir, shape: Shape): string {
  if (dir === 'across') return '→';
  if (dir === 'downLeft') return '↙';
  return shape === 'hex' ? '↘' : '↓';
}
