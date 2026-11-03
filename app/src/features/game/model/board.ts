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
} from '../../../engine';
import type { EntryView } from './entry';
import type { Session } from './session';
import { waysOutFor } from './status';

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
}

export interface BoardOptions {
  /** Dots on the remaining exits when a player is down to 1 or 2 ways out. */
  readonly showWaysOut: boolean;
  /** Pulse the mover's letters (default true). The tutorial turns it off while you watch. */
  readonly showAnchors?: boolean;
}

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
    for (let k = 0; k < c.word.length; k++) {
      const cell = c.dir === 'across' ? c.row * n + c.col + k : (c.row + k) * n + c.col;
      ghost.set(cell, { letter: c.word[k]!, k, link: cell === c.anchor });
    }
  }

  // The most recent word, flashed for the next player until they start typing.
  const lastWord = game.words[game.words.length - 1];
  const flash = new Set(lastWord && !s.typed && !over ? lastWord.cells : []);
  const pop = new Map<CellIndex, number>(
    s.lastPlay ? game.words[s.lastPlay.wordIndex]!.cells.map((c, k) => [c, k] as const) : [],
  );

  // Escape-route dots when the mover is running out of room.
  const routes = new Set<CellIndex>();
  if (opts.showWaysOut && myTurn && !firstMove && !s.typed) {
    const ways = waysOutFor(game, lex, mover);
    if (ways !== null && ways <= 2) {
      exitsOf(moveContext(game, mover), lex)
        .filter((e) => e.words > 0)
        .forEach((e) => e.cells.forEach((c) => routes.add(c)));
    }
  }

  // The boxed-in explanation.
  const boxed = game.result?.reason === 'boxed-in' ? game.result : null;
  const loser = boxed ? (boxed.winner === 0 ? 1 : 0) : null;
  const sealed = new Set(boxed && boxed.boxedWord !== undefined ? game.words[boxed.boxedWord]!.cells : []);
  const explain =
    boxed && loser !== null
      ? boxedInExplanation(exitsOf(moveContext(game, loser), lex), [...sealed])
      : { inTheWay: new Set<CellIndex>(), tooSmall: new Set<CellIndex>() };

  const corner = mover === 0 ? 0 : n * n - 1;

  return game.board.map((cell, index): CellView => {
    const cls = ['cell'];
    let letter = cell?.letter ?? '';
    let linkBadge = false;
    let mark: string | null = null;
    let delay = 0;
    let tap: CellView['tap'] = null;

    if (cell) {
      cls.push(ownerClass(cell.owner));
      if (!fullBoardEnd && recent[cell.owner].has(index)) cls.push('recent');
      if (cell.words.length > 1) cls.push(cell.owner === 0 ? 'xa' : 'xb');
    }

    const g = ghost.get(index);
    if (g) {
      delay = g.k * 30;
      tap = 'flip';
      if (!cell) {
        cls.push(entry.ready ? 'gnew' : 'gpart');
        letter = g.letter;
        linkBadge = g.link;
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
      delay = popAt * 60;
    }
    if (showAnchors && firstMove && index === corner && !g) {
      cls.push('start', mover === 0 ? 'sa' : 'sb');
      mark = mover === 0 ? t('board.start') : t('board.end');
    }
    if (showAnchors && firstMove && mover === 0 && index === n * n - 1 && !cell && !g) {
      cls.push('endmark');
      mark = t('board.end');
    }

    return { index, letter, className: cls.join(' '), linkBadge, mark, delay, tap, label: cellLabel(index, n, letter, cell?.owner, !!g) };
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
