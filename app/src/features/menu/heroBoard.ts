/**
 * The menu's animated board: two chains racing toward each other. Played through the real
 * rules (the tutorial game plus three more moves), so the picture is always a legal game.
 * (The mockup used CUB and ARC; CUB isn't in the word list, so SUB and GAS take their place.)
 */

import { HEX_RULES, newGame, play, playScripted, type Dir, type GameState, type Lexicon, type ScriptedMove, type Shape } from '../../engine';

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

/** The hex board's position: two Easy AIs' first eight words (seed 42), replayed through the engine. */
const HEX_MOVES: readonly { word: string; row: number; col: number; dir: Dir }[] = [
  { word: 'gets', row: 0, col: 4, dir: 'down' },
  { word: 'yard', row: 5, col: 7, dir: 'downLeft' },
  { word: 'swap', row: 3, col: 4, dir: 'across' },
  { word: 'died', row: 8, col: 1, dir: 'across' },
  { word: 'loss', row: 0, col: 7, dir: 'downLeft' },
  { word: 'bond', row: 5, col: 1, dir: 'down' },
  { word: 'seas', row: 3, col: 4, dir: 'down' },
  { word: 'oak', row: 6, col: 1, dir: 'across' },
];

function heroGame(lex: Lexicon, shape: Shape): GameState {
  if (shape === 'square') return playScripted(lex, MOVES);
  return HEX_MOVES.reduce((g, m) => play(g, lex, { ...m, anchor: 0, anchorAt: 'start' }), newGame(HEX_RULES));
}

export interface HeroCell {
  readonly letter: string;
  readonly className: string;
  /** When this letter pops in during the loop, in ms. */
  readonly delay: number;
}

/** Letters appear in the order they were played; each player's last word is highlighted. */
export function heroBoard(lex: Lexicon, shape: Shape = 'square'): { cells: HeroCell[]; game: GameState } {
  const game = heroGame(lex, shape);
  const order = new Map<number, number>();
  game.words.forEach((w) => w.cells.forEach((c) => order.has(c) || order.set(c, order.size)));
  const recent = new Set(game.lastWord.flatMap((i) => (i === null ? [] : game.words[i]!.cells)));
  const cells = game.board.map((cell, index): HeroCell => {
    if (!cell) return { letter: '', className: 'cell', delay: 0 };
    const cls = ['cell', cell.owner === 0 ? 'a' : 'b', 'loop'];
    if (recent.has(index)) cls.push('recent');
    return { letter: cell.letter, className: cls.join(' '), delay: (order.get(index) ?? 0) * 280 };
  });
  return { cells, game };
}
