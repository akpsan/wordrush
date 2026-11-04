import { beforeEach, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { giveUp, playScripted } from '../../engine';
import { FRIEND, type Match } from './model/match';
import { noHints } from './model/session';
import { clearSavedGame, loadSavedGame, saveGame } from './persistence';

const lex = getLexicon();

beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage;
});

it('saves a game in progress and restores it by replaying the moves', () => {
  const game = playScripted(lex, [{ word: 'team', dir: 'down' }, { word: 'stone', dir: 'across' }]);
  saveGame(game, noHints(3, [1, 0]), FRIEND);
  const restored = loadSavedGame(lex);
  expect(restored?.game.words.map((w) => w.word)).toEqual(['team', 'stone']);
  expect(restored?.game.board).toEqual(game.board);
  expect(restored?.hints).toEqual(noHints(3, [1, 0]));
  expect(restored?.match).toEqual(FRIEND);
});

it('does not keep finished games', () => {
  const game = playScripted(lex, [{ word: 'team', dir: 'down' }]);
  saveGame(giveUp(game), noHints(), FRIEND);
  expect(loadSavedGame(lex)).toBeNull();
});

it('discards a damaged save instead of loading an illegal board', () => {
  localStorage.setItem('wordrush:v1:game', JSON.stringify({ version: 1, moves: [{ word: 'zzzz', row: 0, col: 0, dir: 'across' }] }));
  expect(loadSavedGame(lex)).toBeNull();
  clearSavedGame();
});

it('restores who is playing a vs-AI game', () => {
  const match: Match = { mode: 'ai', level: 'hard', human: 1, first: 'random', seed: 42 };
  saveGame(playScripted(lex, [{ word: 'team', dir: 'down' }]), noHints(), match);
  expect(loadSavedGame(lex)?.match).toEqual(match);
});

it('loads a version 1 save as pass and play, and rejects a damaged match', () => {
  const moves = [{ word: 'team', row: 0, col: 0, dir: 'down' }];
  localStorage.setItem('wordrush:v1:game', JSON.stringify({ version: 1, moves }));
  expect(loadSavedGame(lex)?.match).toEqual(FRIEND);
  localStorage.setItem('wordrush:v1:game', JSON.stringify({ version: 2, moves, match: { mode: 'ai', level: 'expert' } }));
  expect(loadSavedGame(lex)).toBeNull();
});
