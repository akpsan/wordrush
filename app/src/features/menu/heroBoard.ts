/**
 * The menu's animated board: two chains racing toward each other. Played through the real
 * rules (the tutorial game plus three more moves), so the picture is always a legal game.
 * (The mockup used CUB and ARC; CUB isn't in the word list, so SUB and GAS take their place.)
 */

import { playScripted, type Lexicon, type ScriptedMove } from '../../engine';

const MOVES: readonly ScriptedMove[] = [
  { word: 'team', dir: 'across' },
  { word: 'dog', dir: 'down' },
  { word: 'map', dir: 'down' },
  { word: 'big', dir: 'across' },
  { word: 'top', dir: 'across' },
  { word: 'sub', dir: 'down', at: 'end' },
  { word: 'tin', dir: 'down', at: 'start' },
  { word: 'gas', dir: 'across', at: 'end' },
];

export interface HeroCell {
  readonly letter: string;
  readonly className: string;
  /** When this letter pops in during the loop, in ms. */
  readonly delay: number;
}

/** Letters appear in the order they were played; each player's last word is highlighted. */
export function heroBoard(lex: Lexicon): HeroCell[] {
  const game = playScripted(lex, MOVES);
  const order = new Map<number, number>();
  game.words.forEach((w) => w.cells.forEach((c) => order.has(c) || order.set(c, order.size)));
  const recent = new Set(game.lastWord.flatMap((i) => (i === null ? [] : game.words[i]!.cells)));
  return game.board.map((cell, index) => {
    if (!cell) return { letter: '', className: 'cell', delay: 0 };
    const cls = ['cell', cell.owner === 0 ? 'a' : 'b', 'loop'];
    if (recent.has(index)) cls.push('recent');
    return { letter: cell.letter, className: cls.join(' '), delay: (order.get(index) ?? 0) * 280 };
  });
}
