/** What the typed letters mean right now: the preview spots and which one is shown. */

import { moveContext, previewEntry, type Lexicon, type Placement, type Preview } from '../../../engine';
import type { Session } from './session';

export interface EntryView {
  readonly typed: string;
  /** Most letters allowed this turn (4 on Blue's first word). */
  readonly maxLen: number;
  readonly preview: Preview;
  readonly spots: readonly Placement[];
  /** Index of the previewed spot: the player's chosen spot if the word still fits there, else 0. */
  readonly index: number;
  readonly current: Placement | null;
  /** A real, unplayed word in a legal spot: Play will work. */
  readonly ready: boolean;
}

export function entryView(s: Pick<Session, 'game' | 'typed' | 'preferred' | 'filter'>, lex: Lexicon): EntryView {
  const { maxLen } = moveContext(s.game);
  const preview = s.game.result ? ({ kind: 'empty' } as const) : previewEntry(s.game, lex, s.typed, s.filter);
  const spots = preview.kind === 'ready' || preview.kind === 'partial' ? preview.spots : [];
  const p = s.preferred;
  const kept = p ? spots.findIndex((q) => q.anchor === p.anchor && q.anchorAt === p.anchorAt && q.dir === p.dir) : -1;
  const index = Math.max(kept, 0);
  return {
    typed: s.typed,
    maxLen,
    preview,
    spots,
    index,
    current: spots[index] ?? null,
    ready: preview.kind === 'ready',
  };
}
