import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { HEX_TWO_WAY_RULES, legalMoves, newGame, play, type Dir } from '../../../engine';
import { impactOf, impactLine } from './impact';
import { FRIEND } from './match';

const lex = getLexicon();

describe('word impact', () => {
  it("counts words to play (up to 3) before and after; the opponent's once they've played", () => {
    const g = newGame();
    const team = legalMoves(g, lex).find((m) => m.word === 'team')!;
    const first = impactOf(g, lex, team)!;
    expect(first.you.before).toBe(3); // 3+ words from the corner
    expect(first.them).toBeNull();
    const g2 = play(play(g, lex, team), lex, legalMoves(play(g, lex, team), lex)[0]!);
    const m = legalMoves(g2, lex)[0]!;
    const i = impactOf(g2, lex, m)!;
    expect(i.them).not.toBeNull();
    expect(i.them!.before).toBeGreaterThan(0);
  });

  it('says so when the word boxes the opponent in', () => {
    // The tutorial's box-in game: PLANT boxes Orange in.
    let g = newGame();
    for (const [word, flip] of [['team', 0], ['star', 1], ['maple', 0], ['dogs', 1]] as const) {
      const ms = legalMoves(g, lex).filter((m) => m.word === word);
      g = play(g, lex, ms[Math.min(flip, ms.length - 1)]!);
    }
    const plant = legalMoves(g, lex).filter((m) => m.word === 'plant').find((m) => impactOf(g, lex, m)!.boxesIn);
    expect(plant).toBeDefined();
    const line = impactLine({ game: g, match: FRIEND }, { ready: true, current: plant! }, lex)!;
    expect(line.text).toBe('**PLANT** boxes Orange in!');
  });

  it('warns about a dead end that the word counts would hide', () => {
    // Turn 10 of a Medium-vs-Hard game on two-way hex: ABLE leaves Blue 3+ words to play, but they all
    // lead into the same pocket, with room for just 1 more word.
    const MOVES: [string, number, number, Dir][] = [
      ['abs', 0, 5, 'down'], ['close', 6, 5, 'down'], ['bass', 5, 5, 'up'], ['cargo', 6, 5, 'upRight'],
      ['bases', 5, 5, 'downLeft'], ['cells', 6, 5, 'across'], ['sans', 7, 3, 'left'], ['cakes', 6, 5, 'downLeft'],
      ['see', 7, 0, 'up'],
    ];
    const g = MOVES.reduce(
      (s, [word, row, col, dir]) => play(s, lex, { word, row, col, dir, anchor: 0, anchorAt: 'start' }),
      newGame(HEX_TWO_WAY_RULES),
    );
    const able = legalMoves(g, lex).find((m) => m.word === 'able' && m.row === 7 && m.col === 4 && m.dir === 'down')!;
    const i = impactOf(g, lex, able)!;
    expect(i.you.after).toBe(3); // the old line said "you 3+ words"
    expect(i.room).toBe(1);
    expect(impactLine({ game: g, match: FRIEND }, { ready: true, current: able }, lex)).toEqual({
      text: '**ABLE** is a dead end: room for 1 more word',
      tone: 'warn',
    });
  });
});
