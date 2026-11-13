import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { HEX_RULES, cellsFor, fitsOnlyBackwards, geometryOf, legalMoves, moveContext, newGame, play, waysOut, type Placement } from '..';

const lex = getLexicon();
const g = geometryOf(HEX_RULES);
const R = (g.size - 1) / 2;

describe('hex geometry', () => {
  it('is a hexagon of radius R: 3R(R+1) + 1 cells, corners top-left and bottom-right', () => {
    expect(g.cells).toBe(3 * R * (R + 1) + 1);
    expect(g.blueCorner).toBe(R); // row 0, column R
    expect(g.orangeCorner).toBe(2 * R * g.size + R);
    expect(g.valid[0]).toBe(false);
    expect(g.valid[g.size * g.size - 1]).toBe(false);
  });

  it('runs words across, down-right and down-left, never off the hexagon', () => {
    expect(cellsFor(g, 0, R, 'downLeft', 3)).toEqual([R, g.size + R - 1, 2 * g.size + R - 2]);
    expect(cellsFor(g, 0, R, 'across', R + 2)).toBeNull(); // the top edge has R + 1 cells
    expect(cellsFor(g, 0, R, 'across', R + 1)).not.toBeNull();
    expect(cellsFor(g, 0, R - 1, 'across', 3)).toBeNull(); // off the board on the left
  });
});

describe('a hex game', () => {
  it('Blue opens from the corner in three directions; Orange closes on the other corner', () => {
    let s = newGame(HEX_RULES);
    expect(waysOut(moveContext(s, 0), lex)).toBe(3);
    const first = legalMoves(s, lex);
    expect(new Set(first.map((m) => m.dir))).toEqual(new Set(['across', 'down', 'downLeft']));
    expect(first.every((m) => m.word.length <= 3)).toBe(true);
    s = play(s, lex, first.find((m) => m.word === 'tea' && m.dir === 'across')!);
    const orange = legalMoves(s, lex);
    expect(orange.every((m) => cellsFor(g, m.row, m.col, m.dir, m.word.length)!.at(-1) === g.orangeCorner)).toBe(true);
  });

  it('accepts a down-left word chained from a letter', () => {
    let s = newGame(HEX_RULES);
    s = play(s, lex, legalMoves(s, lex).find((m) => m.word === 'tea' && m.dir === 'across')!);
    s = play(s, lex, legalMoves(s, lex).find((m) => m.word === 'stone' && m.dir === 'across')!);
    const diag = legalMoves(s, lex).find((m) => m.dir === 'downLeft') as Placement;
    expect(diag).toBeDefined();
    s = play(s, lex, diag);
    expect(s.words.at(-1)!.dir).toBe('downLeft');
  });
});

describe('reading direction', () => {
  it('fitsOnlyBackwards: false when the letters fit as typed or not at all', () => {
    const s = newGame(HEX_RULES);
    expect(fitsOnlyBackwards(s, 'tea')).toBe(false); // fits from the corner as typed
    expect(fitsOnlyBackwards(s, 'te')).toBe(false); // too short to judge
  });
});
