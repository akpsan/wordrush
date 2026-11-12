import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { legalMoves, newGame, play } from '../../../engine';
import { impactOf, impactLine } from './impact';
import { FRIEND } from './match';

const lex = getLexicon();

describe('word impact', () => {
  it("counts the mover's ways out before and after; the opponent's once they've played", () => {
    const g = newGame();
    const team = legalMoves(g, lex).find((m) => m.word === 'team')!;
    const first = impactOf(g, lex, team)!;
    expect(first.you.before).toBe(2);
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
});
