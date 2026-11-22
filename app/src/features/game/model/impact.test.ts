import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { HEX_TWO_WAY_RULES, legalMoves, newGame, play, replayMoves, type MoveLike } from '../../../engine';
import { impactOf, impactLine } from './impact';
import { createSession } from './session';
import { playerStatus } from './status';
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
    // Turn 10 of a Medium-vs-Hard game on two-way hex: ABLE leaves Orange 3+ words to play, but they all
    // lead into the same pocket, with room for just 1 more word.
    const MOVES: MoveLike[] = [
      { word: 'abs', row: 0, col: 5, dir: 'down' },
      { word: 'close', row: 6, col: 5, dir: 'down' },
      { word: 'bass', row: 5, col: 5, dir: 'up' },
      { word: 'cargo', row: 6, col: 5, dir: 'upRight' },
      { word: 'bases', row: 5, col: 5, dir: 'downLeft' },
      { word: 'cells', row: 6, col: 5, dir: 'across' },
      { word: 'sans', row: 7, col: 3, dir: 'left' },
      { word: 'cakes', row: 6, col: 5, dir: 'downLeft' },
      { word: 'see', row: 7, col: 0, dir: 'up' },
    ];
    const g = replayMoves(HEX_TWO_WAY_RULES, lex, MOVES);
    const able = legalMoves(g, lex).find((m) => m.word === 'able' && m.row === 7 && m.col === 4 && m.dir === 'down')!;
    const i = impactOf(g, lex, able)!;
    expect(i.you.after).toBe(3); // the old line said "you 3+ words"
    expect(i.room).toBe(1);
    expect(impactLine({ game: g, match: FRIEND }, { ready: true, current: able }, lex)).toEqual({
      text: '**ABLE** is a dead end: room for 1 more word',
      tone: 'warn',
    });
  });

  it("shows the dead end on the player's card once the word is played", () => {
    const MOVES: MoveLike[] = [
      { word: 'abs', row: 0, col: 5, dir: 'down' },
      { word: 'close', row: 6, col: 5, dir: 'down' },
      { word: 'bass', row: 5, col: 5, dir: 'up' },
      { word: 'cargo', row: 6, col: 5, dir: 'upRight' },
      { word: 'bases', row: 5, col: 5, dir: 'downLeft' },
      { word: 'cells', row: 6, col: 5, dir: 'across' },
      { word: 'sans', row: 7, col: 3, dir: 'left' },
      { word: 'cakes', row: 6, col: 5, dir: 'downLeft' },
      { word: 'see', row: 7, col: 0, dir: 'up' },
      { word: 'able', row: 7, col: 4, dir: 'down' },
    ];
    const g = replayMoves(HEX_TWO_WAY_RULES, lex, MOVES);
    // ABLE was the tenth word, Orange's. It's Blue's turn, so Orange's card warns without the pulsing alarm.
    const orange = playerStatus(createSession(g), lex, 1);
    expect(orange.ways).toBe(3); // the count alone would say "3+ words to play"
    expect(orange).toMatchObject({ deadEnd: 1, label: 'Dead end: 1 word left', level: 'danger', warn: true, alarm: false });
  });
});
