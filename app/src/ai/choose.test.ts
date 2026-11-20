import { describe, expect, it } from 'vitest';
import { getHintWords, getLexicon } from '../dictionary';
import { isLegal, newGame, play, playScripted, STANDARD_RULES, type GameState } from '../engine';
import { chooseMove, LEVELS, type Level } from './choose';
import { createRng } from './random';
import pinnedGames from './__tests__/fixtures/pinned-games.json';

const lex = getLexicon();
const familiar = getHintWords();
const ctx = (seed: number) => ({ lex, familiar, rng: createRng(seed) });

/** Play a whole game between two levels and return it. */
function selfPlay(blue: Level, orange: Level, seed: number): GameState {
  let state = newGame();
  const rng = createRng(seed);
  while (!state.result) {
    const move = chooseMove(state.toMove === 0 ? blue : orange, state, { lex, familiar, rng });
    expect(move).not.toBeNull();
    expect(isLegal(state, lex, move!)).toBe(true);
    state = play(state, lex, move!);
  }
  return state;
}

describe('the AI opponents', () => {
  it.each(LEVELS)('%s plays only legal moves, all the way to the end of a game', (level) => {
    const game = selfPlay(level, level, 7);
    expect(game.result?.reason).toBe('boxed-in');
  }, 60_000);

  it('makes the same choice for the same seed', () => {
    const state = playScripted(lex, [{ word: 'team', dir: 'across' }]);
    for (const level of LEVELS) {
      expect(chooseMove(level, state, ctx(3))).toEqual(chooseMove(level, state, ctx(3)));
    }
  }, 30_000);

  it('prefers everyday words', () => {
    const state = playScripted(lex, [{ word: 'team', dir: 'across' }]);
    for (const level of LEVELS) {
      for (let seed = 0; seed < 3; seed++) expect(familiar.has(chooseMove(level, state, ctx(seed))!.word)).toBe(true);
    }
  }, 30_000);

  it('Hard boxes you in when it can', () => {
    // The tutorial's last lesson: Blue to move, and PLANT boxes DOGS in.
    const state = playScripted(lex, [
      { word: 'team', dir: 'across' },
      { word: 'star', dir: 'down' },
      { word: 'maple', dir: 'across' },
      { word: 'dogs', dir: 'down' },
    ]);
    const move = chooseMove('hard', state, ctx(1))!;
    expect(play(state, lex, move).result).toMatchObject({ winner: 0, reason: 'boxed-in' });
  });

  it('stops looking when out of time, and still plays a legal move', () => {
    const state = playScripted(lex, [{ word: 'team', dir: 'across' }, { word: 'stone', dir: 'across' }]);
    const move = chooseMove('hard', state, { ...ctx(2), outOfTime: () => true });
    expect(move && isLegal(state, lex, move)).toBe(true);
  });

  it('has no move once the game is over', () => {
    const state = { ...newGame(), result: { winner: 0 as const, reason: 'gave-up' as const } };
    expect(chooseMove('medium', state, ctx(0))).toBeNull();
  });
});

/**
 * Pinned decisions on the square board: seeded games between all level pairings, recorded as
 * `word@row,col,dir`. A speed-up or refactor of the AI must not change a single choice.
 * Regenerate only when the AI's choices are meant to change.
 */
describe('pinned AI games (square board)', () => {
  it.each(pinnedGames.map((g) => [`${g.blue} vs ${g.orange}, seed ${g.seed}`, g] as const))('%s', (_name, g) => {
    let state = newGame(STANDARD_RULES);
    const rng = createRng(g.seed);
    const moves: string[] = [];
    while (!state.result) {
      const move = chooseMove(state.toMove === 0 ? g.blue as Level : g.orange as Level, state, { lex, familiar, rng });
      expect(move).not.toBeNull();
      moves.push(`${move!.word}@${move!.row},${move!.col},${move!.dir}`);
      state = play(state, lex, move!);
    }
    expect(moves).toEqual(g.moves);
  }, 120_000);
});
