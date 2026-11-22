import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { HEX_RULES, HEX_TWO_WAY_RULES, cellsFor, fitsOnlyBackwards, geometryOf, legalMoves, moveContext, neighbours, newGame, play, rulesFor, waysOut, type Placement } from '..';

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

  it('fitsOnlyBackwards: true for letters that only fit reversed, never with two-way words', () => {
    const afterTea = (rules: typeof HEX_RULES) => {
      let s = newGame(rules);
      s = play(s, lex, legalMoves(s, lex).find((m) => m.word === 'tea' && m.dir === 'across')!);
      return play(s, lex, legalMoves(s, lex)[0]!); // Orange's first word, far from TEA
    };
    // Nothing on the board can end on TEA's T, but "txx" can start on it and run down-right.
    expect(fitsOnlyBackwards(afterTea(HEX_RULES), 'xxt')).toBe(true);
    expect(fitsOnlyBackwards(afterTea(HEX_TWO_WAY_RULES), 'xxt')).toBe(false);
  });

  it('two-way words add the backward directions on hex', () => {
    expect(geometryOf(HEX_RULES).dirs).toHaveLength(3);
    expect(geometryOf(HEX_TWO_WAY_RULES).dirs).toEqual(['across', 'down', 'downLeft', 'left', 'up', 'upRight']);
  });
});

describe('neighbours', () => {
  it('on a square board is the in-grid cells above, below, left and right', () => {
    const sq = geometryOf(rulesFor('square'));
    const n = sq.size;
    for (let i = 0; i < n * n; i++) {
      const r = Math.floor(i / n);
      const c = i % n;
      const reference: number[] = [];
      if (r > 0) reference.push(i - n);
      if (r < n - 1) reference.push(i + n);
      if (c > 0) reference.push(i - 1);
      if (c < n - 1) reference.push(i + 1);
      expect(neighbours(sq, i)).toEqual(reference);
    }
  });

  it('on a hex board gives an interior cell its six valid neighbours', () => {
    const centre = R * g.size + R;
    const found = neighbours(g, centre);
    expect(found).toEqual([centre - g.size, centre + g.size, centre - 1, centre + 1, centre - g.size + 1, centre + g.size - 1]);
    expect(found.every((i) => g.valid[i])).toBe(true);
  });

  it('on a hex board gives edge and corner cells only their on-board neighbours', () => {
    const s = g.size;
    expect(neighbours(g, g.blueCorner)).toEqual([s + R, R + 1, s + R - 1]);
    expect(neighbours(g, g.orangeCorner)).toEqual([g.orangeCorner - s, g.orangeCorner - 1, g.orangeCorner - s + 1]);
    expect(neighbours(g, R + 2)).toEqual([s + R + 2, R + 1, R + 3, s + R + 1]); // top edge
  });

  it('on a hex board is symmetric and never leaves the hexagon', () => {
    for (let i = 0; i < g.size * g.size; i++) {
      if (!g.valid[i]) continue;
      for (const j of neighbours(g, i)) {
        expect(g.valid[j]).toBe(true);
        expect(neighbours(g, j)).toContain(i);
      }
    }
  });
});
