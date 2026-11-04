/**
 * Who's playing: two people on one device, or a person against an AI. Fixed for a game.
 * Every "who is this player called" question goes through here, so the rest of the game
 * never branches on the mode for names.
 */

import { aiLevelName, aiName, playerName } from '../../../copy';
import type { Player } from '../../../engine';
import type { Level } from '../../../ai';

/** Who goes first in a vs-AI game, as chosen in setup. Random is resolved when the game starts. */
export type FirstChoice = 'you' | 'ai' | 'random';

export type Match =
  | { readonly mode: 'friend' }
  | {
      readonly mode: 'ai';
      readonly level: Level;
      /** The person's colour. Blue always moves first. */
      readonly human: Player;
      /** Kept for Rematch: the same choice again (Random re-rolls). */
      readonly first: FirstChoice;
      /** Seeds the AI's choices, so a saved game continues the same way. */
      readonly seed: number;
    };

export type AiMatch = Extract<Match, { mode: 'ai' }>;

export const FRIEND: Match = { mode: 'friend' };

export const isAi = (m: Match, p: Player): boolean => m.mode === 'ai' && m.human !== p;

/** The person's colour, or null in pass and play (both players are people). */
export const humanOf = (m: Match): Player | null => (m.mode === 'ai' ? m.human : null);

/** What a player is called on screen: Blue or Orange, or the AI's name. */
export const nameOf = (m: Match, p: Player): string => (m.mode === 'ai' && m.human !== p ? aiName(m.level) : playerName(p));

/** The AI's name and difficulty, for copy with {ai} and {level}. */
export const aiParams = (m: AiMatch) => ({ ai: aiName(m.level), level: aiLevelName(m.level) });
