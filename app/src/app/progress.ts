/** What the player has done so far: decides the menu's layout (first launch, which mode first). */

import { load, save } from '../platform/storage';

export interface Progress {
  readonly tutorialSeen: boolean;
  readonly hasPlayed: boolean;
  /** The mode played last: the menu puts it first. */
  readonly lastMode: 'ai' | 'friend' | null;
}

const KEY = 'progress';

export function loadProgress(): Progress {
  const raw = load<Partial<Progress> | null>(KEY, null);
  const lastMode = raw?.lastMode === 'ai' || raw?.lastMode === 'friend' ? raw.lastMode : null;
  return { tutorialSeen: raw?.tutorialSeen === true, hasPlayed: raw?.hasPlayed === true, lastMode };
}

export function saveProgress(p: Progress): void {
  save(KEY, p);
}
