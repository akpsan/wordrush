import { beforeEach, expect, it } from 'vitest';
import { humanColour, loadAiSetup, loadRecords, recordGame, saveAiSetup } from './setup';

beforeEach(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage;
});

it('maps who goes first to the person\'s colour (Blue always moves first)', () => {
  expect(humanColour('you')).toBe(0);
  expect(humanColour('ai')).toBe(1);
  expect(humanColour('random', () => 0.2)).toBe(0);
  expect(humanColour('random', () => 0.8)).toBe(1);
});

it('remembers the last setup, and ignores a damaged one', () => {
  expect(loadAiSetup()).toBeNull();
  saveAiSetup({ level: 'hard', first: 'random' });
  expect(loadAiSetup()).toEqual({ level: 'hard', first: 'random' });
  localStorage.setItem('wordrush:v1:aiSetup', JSON.stringify({ level: 'expert', first: 'you' }));
  expect(loadAiSetup()).toBeNull();
});

it('keeps wins, losses and games per opponent', () => {
  let r = loadRecords();
  expect(r.hard).toEqual({ wins: 0, losses: 0, games: 0 });
  r = recordGame(r, 'hard', true);
  r = recordGame(r, 'hard', false);
  r = recordGame(r, 'easy', true);
  expect(loadRecords()).toEqual({
    easy: { wins: 1, losses: 0, games: 1 },
    medium: { wins: 0, losses: 0, games: 0 },
    hard: { wins: 1, losses: 1, games: 2 },
  });
});
