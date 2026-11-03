/**
 * All player-facing text. Components never contain copy: they call t() with an ID.
 * Strings may contain **bold** markers (render them with <RichText>) and {params}.
 */

import { deck } from './deck';
import { overrides } from './overrides';

const strings = { ...deck, ...overrides } as const;

export type CopyId = keyof typeof strings;
export type CopyParams = Readonly<Record<string, string | number>>;

/** Look up a string and fill in its {params}. Missing params are left visible, to catch them in tests. */
export function t(id: CopyId, params: CopyParams = {}): string {
  return strings[id].replace(/\{([^}]+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Same as t(), without the **bold** markers. For aria-labels and other plain-text places. */
export const plain = (id: CopyId, params?: CopyParams): string => t(id, params).replace(/\*\*/g, '');

/** "S, T, A or R": how the deck lists a player's letters. */
export function listLetters(letters: readonly string[]): string {
  const up = letters.map((l) => l.toUpperCase());
  if (up.length <= 1) return up.join('');
  return `${up.slice(0, -1).join(', ')} or ${up[up.length - 1]}`;
}

export const playerName = (player: 0 | 1): string => (player === 0 ? t('player.blue') : t('player.orange'));
