/** What the hint chip shows: the hinted word's tiles (revealed letters and the link letter) and hints left. */

import { linkIndex } from '../../../engine';
import { hintsLeft, type Session } from './session';

export interface HintTile {
  /** The letter, or null while it's still hidden. */
  readonly letter: string | null;
  /** Revealed by a hint (highlighted), as opposed to the link letter the player already knows. */
  readonly revealed: boolean;
}

export interface HintView {
  readonly tiles: readonly HintTile[];
  readonly left: number;
}

export function hintView(s: Session): HintView | null {
  const current = s.hints.current;
  if (!current || s.game.result) return null;
  const firstMove = s.game.lastWord[s.game.toMove] === null;
  const link = firstMove ? -1 : linkIndex(current.spot);
  const tiles = [...current.spot.word].map((letter, k): HintTile => {
    const revealed = current.revealed.includes(k);
    return { letter: revealed || k === link ? letter.toUpperCase() : null, revealed };
  });
  return { tiles, left: hintsLeft(s) };
}
