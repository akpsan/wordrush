import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import {
  checkEntry,
  createLexicon,
  giveUp,
  legalMoves,
  moveContext,
  newGame,
  play,
  previewEntry,
  waysOut,
  type GameState,
  type Placement,
} from '..';

const lex = getLexicon();

/** Play the first spot the engine offers for a word in a given direction and anchor mode. */
function playWord(state: GameState, word: string, dir: 'across' | 'down', at?: 'start' | 'end'): GameState {
  const check = checkEntry(state, lex, word);
  if (!check.ok) throw new Error(`${word}: ${check.problem}`);
  const spot = check.spots.find((s) => s.dir === dir && (!at || s.anchorAt === at));
  if (!spot) throw new Error(`${word}: no ${dir} spot`);
  return play(state, lex, spot);
}

function render(state: GameState): string {
  const n = state.rules.size;
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const cell = state.board[r * n + c];
      return !cell ? '.' : cell.owner === 0 ? cell.letter.toUpperCase() : cell.letter;
    }).join(' '),
  ).join('\n');
}

const STEP5: [string, 'across' | 'down'][] = [
  ['team', 'across'],
  ['dog', 'down'],
  ['map', 'down'],
  ['big', 'across'],
];

const playAll = (moves: [string, 'across' | 'down'][]) =>
  moves.reduce((s, [w, d]) => playWord(s, w, d), newGame());

/**
 * The tutorial board after step 6 (TOP), with Blue to move again, as in the tutorial,
 * where the opponent doesn't reply between steps 6 and 7.
 */
const tutorialBoard = (): GameState => ({ ...playAll([...STEP5, ['top', 'across']]), toMove: 0 });

describe('first moves', () => {
  it('Blue starts in the top-left corner, across or down, at most 4 letters', () => {
    const s = newGame();
    const team = checkEntry(s, lex, 'team');
    expect(team.ok && team.spots.map((p) => [p.row, p.col, p.dir])).toEqual([
      [0, 0, 'across'],
      [0, 0, 'down'],
    ]);
    expect(checkEntry(s, lex, 'teams')).toEqual({ ok: false, problem: 'no-room' });
  });

  it("Orange's first word ends in the bottom-right corner, up to 5 letters", () => {
    const s = playWord(newGame(), 'team', 'across');
    const stone = checkEntry(s, lex, 'stone');
    expect(stone.ok && stone.spots.map((p) => [p.row, p.col, p.dir])).toEqual([
      [7, 3, 'across'],
      [3, 7, 'down'],
    ]);
  });
});

describe('the Learn to play script', () => {
  it('matches the board in the tutorial', () => {
    expect(render(tutorialBoard())).toBe(
      [
        'T E A M . . . .',
        '. . . A . . . .',
        '. T O P . . . .',
        '. . . . . . . .',
        '. . . . . . . .',
        '. . . . . . . d',
        '. . . . . . . o',
        '. . . . . b i g',
      ].join('\n'),
    );
  });

  it('MAP shows across first, then down as 2 of 2', () => {
    let s = newGame();
    s = playWord(s, 'team', 'across');
    s = playWord(s, 'dog', 'down');
    const map = checkEntry(s, lex, 'map');
    expect(map.ok && map.spots.map((p) => p.dir)).toEqual(['across', 'down']);
  });

  it('TOP ends on the P of MAP, in exactly one spot', () => {
    const top = checkEntry(playAll(STEP5), lex, 'top');
    expect(top.ok && top.spots.map((p) => [p.row, p.col, p.dir, p.anchorAt])).toEqual([[2, 1, 'across', 'end']]);
  });

  it('step 7: CAT has no spot, because your own E is in the way', () => {
    // The original OPEN fits going down, so the lesson uses CAT: it can only end on your T,
    // and coming down onto the T it runs into the E of TEAM.
    expect(checkEntry(tutorialBoard(), lex, 'cat')).toEqual({ ok: false, problem: 'no-room' });
  });

  it('step 8: POPE boxes in JAIL, taking Orange from 63 moves to 0', () => {
    let s = newGame();
    const script: [string, 'across' | 'down', ('start' | 'end')?][] = [
      ['acts', 'across'], ['hull', 'down'], ['sheep', 'down'], ['jail', 'across', 'end'],
    ];
    for (const [w, d, at] of script) s = playWord(s, w, d, at);
    expect(render(s).split('\n').slice(4, 8)).toEqual([
      '. . . P . . . h',
      '. . . . . . . u',
      '. . . . j a i l',
      '. . . . . . . l',
    ]);
    expect(legalMoves(s, lex, 1)).toHaveLength(63);
    const pope = checkEntry(s, lex, 'pope');
    expect(pope.ok).toBe(true);
    const across = pope.ok ? pope.spots.find((p) => p.dir === 'across' && p.row === 4)! : null;
    s = play(s, lex, across!);
    expect(s.result).toEqual({ winner: 0, reason: 'boxed-in', boxedWord: 3 });
  });
});

describe('checking a word (order: too short, already played, not a word, doesn\'t fit)', () => {
  const s = tutorialBoard(); // Blue to move, last word TOP

  it('reports each problem', () => {
    expect(checkEntry(s, lex, 'to')).toEqual({ ok: false, problem: 'too-short' });
    expect(checkEntry(s, lex, 'map')).toEqual({ ok: false, problem: 'already-played' });
    expect(checkEntry(s, lex, 'tqx')).toEqual({ ok: false, problem: 'not-a-word' });
    expect(checkEntry(s, lex, 'cat')).toEqual({ ok: false, problem: 'no-room' });
    expect(checkEntry(s, lex, 'fish')).toEqual({ ok: false, problem: 'not-your-letter' });
  });
});

describe('previews never reveal the word list', () => {
  const s = tutorialBoard();

  it('shows a partial preview from geometry alone', () => {
    expect(previewEntry(s, lex, '').kind).toBe('empty');
    expect(previewEntry(s, lex, 'o').kind).toBe('partial');
    expect(previewEntry(s, lex, 'oqz').kind).toBe('partial'); // not a word, but fits
    expect(previewEntry(s, lex, 'fi').kind).toBe('no-spot');
  });

  it('turns ready only for a real, unplayed word that fits', () => {
    const p = previewEntry(s, lex, 'oak');
    expect(p.kind).toBe('ready');
  });

  it('respects the tapped-letter filter', () => {
    const onP = 2 * 8 + 3;
    const p = previewEntry(s, lex, 'oak', onP);
    expect(p.kind).toBe('no-spot');
  });
});

describe('ways out and giving up', () => {
  it('ways out is 0 exactly when a player has no moves', () => {
    const s = tutorialBoard();
    expect(waysOut(moveContext(s, 0), lex)).toBeGreaterThan(0);
    const tiny = createLexicon(['abc']);
    expect(waysOut(moveContext(s, 0), tiny)).toBe(0);
    expect(legalMoves(s, tiny)).toHaveLength(0);
  });

  it('giving up hands the win to the opponent', () => {
    const s = giveUp(tutorialBoard());
    expect(s.result).toEqual({ winner: 1, reason: 'gave-up' });
  });

  it('rejects illegal moves', () => {
    const bad: Placement = { word: 'zzz', row: 0, col: 0, dir: 'across', anchor: 0, anchorAt: 'start' };
    expect(() => play(newGame(), lex, bad)).toThrow(/Illegal/);
  });
});
