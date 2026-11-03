import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { checkEntry, isLegal, moveContext, pickHint, play, playScripted, waysOut } from '../../../engine';
import { hintView } from './hint';
import { createSession, hintsLeft, noHints, sessionReducer, type Session, type SessionAction } from './session';

const lex = getLexicon();
const reduce = sessionReducer(lex);
const run = (actions: SessionAction[], s: Session) => actions.reduce(reduce, s);
const hint: SessionAction = { type: 'hint' };
const midGame = () => playScripted(lex, [{ word: 'team', dir: 'across' }, { word: 'stone', dir: 'across' }]);

describe('picking a hint', () => {
  it('suggests a legal word that leaves the player room', () => {
    const game = midGame();
    const spot = pickHint(game, lex)!;
    expect(isLegal(game, lex, spot)).toBe(true);
    expect(checkEntry(game, lex, spot.word).ok).toBe(true);
  });

  it('is quick enough to feel instant', () => {
    const game = midGame();
    const start = performance.now();
    pickHint(game, lex);
    expect(performance.now() - start).toBeLessThan(300);
  });

  it('leaves the player room after playing the hinted word', () => {
    const game = midGame();
    const after = play(game, lex, pickHint(game, lex)!);
    expect(waysOut(moveContext({ ...after, toMove: 0 }, 0), lex)).toBeGreaterThan(0);
  });
});

describe('using hints in a game', () => {
  it('does nothing when hints are off', () => {
    const s = run([hint], createSession(midGame()));
    expect(s.hints.current).toBeNull();
  });

  it('reveals one letter at a time, never the link letter, and counts each use', () => {
    let s = createSession(midGame(), noHints(3));
    s = run([hint], s);
    const view = hintView(s)!;
    const spot = s.hints.current!.spot;
    const link = spot.anchorAt === 'start' ? 0 : spot.word.length - 1;
    expect(view.tiles[link]!.letter).toBe(spot.word[link]!.toUpperCase()); // the known link letter
    expect(view.tiles.filter((t) => t.revealed)).toHaveLength(1);
    expect(hintsLeft(s)).toBe(2);
    s = run([hint], s);
    expect(s.hints.current!.spot).toEqual(spot); // same word, one more letter
    expect(hintView(s)!.tiles.filter((t) => t.revealed)).toHaveLength(2);
  });

  it('stops at the allowance', () => {
    const s = run([hint, hint], createSession(midGame(), noHints(1)));
    expect(s.hints.used).toEqual([1, 0]);
  });

  it('clears the chip after playing, but the count carries on for the game', () => {
    let s = run([hint], createSession(midGame(), noHints(3)));
    const word = s.hints.current!.spot.word;
    s = run([...[...word].map((letter) => ({ type: 'letter', letter }) as const)], s);
    // Flip to the hinted spot, then play it.
    const target = s.hints.current!.spot;
    for (let i = 0; i < 6 && !(s.typed === word && isAt(s, target)); i++) s = run([{ type: 'flip' }], s);
    s = run([{ type: 'play' }], s);
    expect(s.hints.current).toBeNull();
    expect(s.hints.used).toEqual([1, 0]);
    expect(hintsLeft(s)).toBe(3); // Orange's turn: Orange hasn't used any
  });
});

function isAt(s: Session, target: { row: number; col: number; dir: string }): boolean {
  const spots = checkEntry(s.game, lex, s.typed);
  if (!spots.ok) return false;
  const p = s.preferred;
  const current = spots.spots.find((q) => p && q.anchor === p.anchor && q.anchorAt === p.anchorAt && q.dir === p.dir) ?? spots.spots[0];
  return !!current && current.row === target.row && current.col === target.col && current.dir === target.dir;
}
