/** What the player has done so far: decides the menu's first-launch layout. */

import { load, save } from '../platform/storage';

export interface Progress {
  readonly tutorialSeen: boolean;
  readonly hasPlayed: boolean;
}

const KEY = 'progress';

export function loadProgress(): Progress {
  const raw = load<Partial<Progress> | null>(KEY, null);
  return { tutorialSeen: raw?.tutorialSeen === true, hasPlayed: raw?.hasPlayed === true };
}

export function saveProgress(p: Progress): void {
  save(KEY, p);
}
