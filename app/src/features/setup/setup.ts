/**
 * Play vs AI setup: the remembered choice (opponent and who goes first) and a light record per
 * opponent, both stored on this device. Pure helpers plus storage; no UI.
 */

import { LEVELS, type Level } from '../../ai';
import type { Player } from '../../engine';
import { load, save } from '../../platform/storage';
import type { FirstChoice } from '../game';

export interface AiSetup {
  readonly level: Level;
  readonly first: FirstChoice;
}

/** The setup sheet's defaults the first time (design: Medium, you go first). */
export const DEFAULT_SETUP: AiSetup = { level: 'medium', first: 'you' };

/** Learn to play's last button: an easy first game, with you going first. */
export const FIRST_GAME_SETUP: AiSetup = { level: 'easy', first: 'you' };

const FIRST_CHOICES: readonly FirstChoice[] = ['you', 'ai', 'random'];

/** The person's colour for a new game. Blue always moves first; Random flips a coin. */
export function humanColour(first: FirstChoice, rng: () => number = Math.random): Player {
  if (first === 'you') return 0;
  if (first === 'ai') return 1;
  return rng() < 0.5 ? 0 : 1;
}

const SETUP_KEY = 'aiSetup';

/** The last setup used, or null if the player has never played vs AI. */
export function loadAiSetup(): AiSetup | null {
  const raw = load<Partial<AiSetup> | null>(SETUP_KEY, null);
  if (!raw || !LEVELS.includes(raw.level as Level) || !FIRST_CHOICES.includes(raw.first as FirstChoice)) return null;
  return { level: raw.level as Level, first: raw.first as FirstChoice };
}

export const saveAiSetup = (setup: AiSetup): void => save(SETUP_KEY, setup);

/** Results against one opponent. Giving up counts as a loss. Only wins are shown. */
export interface AiRecord {
  readonly wins: number;
  readonly losses: number;
  readonly games: number;
}

export type AiRecords = Readonly<Record<Level, AiRecord>>;

const EMPTY: AiRecord = { wins: 0, losses: 0, games: 0 };
const RECORDS_KEY = 'aiRecords';

const count = (n: unknown): number => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : 0);

export function loadRecords(): AiRecords {
  const raw = load<Partial<Record<Level, Partial<AiRecord>>> | null>(RECORDS_KEY, null) ?? {};
  const read = (level: Level): AiRecord => {
    const r = raw[level] ?? {};
    return { wins: count(r.wins), losses: count(r.losses), games: count(r.games) };
  };
  return { easy: read('easy'), medium: read('medium'), hard: read('hard') };
}

/** Add one finished game to the records, save them, and return the new records. */
export function recordGame(records: AiRecords, level: Level, won: boolean): AiRecords {
  const r = records[level] ?? EMPTY;
  const next: AiRecords = {
    ...records,
    [level]: { wins: r.wins + (won ? 1 : 0), losses: r.losses + (won ? 0 : 1), games: r.games + 1 },
  };
  save(RECORDS_KEY, next);
  return next;
}
