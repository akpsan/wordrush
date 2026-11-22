import { describe, expect, it } from 'vitest';
import { getHintWords, getLexicon } from '../dictionary';
import { isLegal, newGame, play, playScripted, type GameState } from '../engine';
import { chooseMove, LEVELS, type Level } from './choose';
import { createRng } from './random';

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

/** The moves of a seeded game between two levels, as word@row,col,dir. */
function selfPlayMoves(blue: Level, orange: Level, seed: number): string[] {
  let state = newGame();
  const rng = createRng(seed);
  const moves: string[] = [];
  while (!state.result) {
    const move = chooseMove(state.toMove === 0 ? blue : orange, state, { lex, familiar, rng })!;
    moves.push(`${move.word}@${move.row},${move.col},${move.dir}`);
    state = play(state, lex, move);
  }
  return moves;
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

  it('plays the same seeded games on the square board as before nearMoves used hex neighbours', () => {
    // Recorded from the square-board AI before nearMoves moved to geometry.neighbours.
    const golden: { blue: Level; orange: Level; seed: number; moves: string[] }[] = [
      { blue: 'medium', orange: 'medium', seed: 11, moves: [
        'acts@0,0,across', 'specs@3,7,down', 'shots@0,3,down', 'sans@7,4,across',
        'sign@4,3,across', 'sells@7,0,across', 'eyes@4,0,across', 'res@5,4,down',
        'eat@4,2,down', 'rim@5,4,across', 'some@1,2,down',
      ] },
      { blue: 'hard', orange: 'medium', seed: 12, moves: [
        'adds@0,0,across', 'safe@7,4,across', 'swiss@0,3,down', 'cases@3,4,down',
        'seem@4,3,down', 'sets@5,4,across', 'swim@7,0,across', 'sales@1,7,down',
        'sri@5,2,down', 'she@4,5,across', 'ins@5,0,across', 'heath@0,6,down',
        'genes@1,2,down', 'ash@0,4,across', 'sue@4,0,across', 'snap@0,5,down',
        'aahs@1,0,down',
      ] },
      { blue: 'medium', orange: 'hard', seed: 13, moves: [
        'acts@0,0,across', 'roses@3,7,down', 'seeks@0,3,down', 'same@6,4,across',
        'send@4,3,down', 'tom@4,6,down', 'dose@5,0,across', 'lot@4,4,across',
        'ser@5,2,down', 'steal@0,4,down', 'seeds@1,2,down', 'ask@3,4,across',
        'med@4,0,across', 'spas@0,5,down', 'team@1,0,down', 'sab@0,5,across',
      ] },
      { blue: 'hard', orange: 'hard', seed: 14, moves: [
        'acts@0,0,across', 'seat@4,7,down', 'spray@0,3,down', 'site@5,4,across',
        'alert@3,3,across', 'slots@5,0,across', 'idea@3,0,across', 'sen@5,4,down',
        'eye@1,2,down', 'end@6,4,across', 'say@2,0,across', 'base@6,1,across',
      ] },
    ];
    for (const { blue, orange, seed, moves } of golden) {
      expect(selfPlayMoves(blue, orange, seed)).toEqual(moves);
    }
  }, 300_000);

  it('has no move once the game is over', () => {
    const state = { ...newGame(), result: { winner: 0 as const, reason: 'gave-up' as const } };
    expect(chooseMove('medium', state, ctx(0))).toBeNull();
  });
});
