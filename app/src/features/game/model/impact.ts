/**
 * What a ready word would do to the room on the board: how many words the mover and the opponent
 * could play next (counted up to 3, shown as 1, 2 or 3+), before and after. Shown once a word is ready (a real word in a legal spot), so it never reveals
 * the word list. Asks the engine: plays the word on a copy and counts each player's legal words.
 * Also checks the mover's room after the word (words they could chain alone): a word can leave several
 * words to play that all lead into the same dead end, which the counts alone don't show.
 */

import { t } from '../../../copy';
import { countLegalMoves, otherPlayer, play, roomOf, type GameState, type Lexicon, type Placement } from '../../../engine';
import type { EntryView } from './entry';
import { nameOf } from './match';
import type { Session } from './session';

export interface Impact {
  /** The word boxes the opponent in: playing it wins. */
  readonly boxesIn: boolean;
  readonly you: { readonly before: number; readonly after: number };
  /** Null before the opponent's first word (they have no ways out to count yet). */
  readonly them: { readonly before: number; readonly after: number } | null;
  /** Words the mover could still chain alone after this word: 1 or 2 is a dead end, 3 means open (or not proven). */
  readonly room: number;
}

export function impactOf(game: GameState, lex: Lexicon, p: Placement): Impact | null {
  if (game.result) return null;
  const me = game.toMove;
  const opp = otherPlayer(me);
  let next: GameState;
  try {
    next = play(game, lex, p);
  } catch {
    return null;
  }
  const count = (g: GameState, who: typeof me) => Math.min(countLegalMoves(g, lex, who), 3);
  const boxesIn = next.result?.reason === 'boxed-in' && next.result.winner === me;
  return {
    boxesIn,
    room: boxesIn ? 3 : roomOf(next, lex, me),
    you: { before: count(game, me), after: count(next, me) },
    them: game.lastWord[opp] === null ? null : { before: count(game, opp), after: boxesIn ? 0 : count(next, opp) },
  };
}

const words = (n: number): string => (n === 1 ? t('impact.one') : t('impact.n', { n: n >= 3 ? '3+' : n }));

export type ImpactTone = 'good' | 'warn' | 'err' | 'neutral';

/** The note-row line for a ready word, or null when there's nothing ready to play. */
export function impactLine(
  s: Pick<Session, 'game' | 'match'>,
  entry: Pick<EntryView, 'ready' | 'current'>,
  lex: Lexicon,
): { text: string; tone: ImpactTone } | null {
  if (!entry.ready || !entry.current) return null;
  const impact = impactOf(s.game, lex, entry.current);
  if (!impact) return null;
  const WORD = entry.current.word.toUpperCase();
  const opp = nameOf(s.match, otherPlayer(s.game.toMove));
  if (impact.boxesIn) return { text: t('impact.boxes', { WORD, opp }), tone: 'good' };
  const { you, them } = impact;
  // No words next turn: whatever the opponent plays, you're boxed in.
  if (you.after === 0) return { text: t('impact.lose', { WORD }), tone: 'err' };
  // Words to play, but all into a dead end: say how far it goes instead of how many words fit.
  if (impact.room === 1) return { text: t('impact.deadend.one', { WORD }), tone: 'warn' };
  if (impact.room === 2) return { text: t('impact.deadend.two', { WORD }), tone: 'warn' };
  const text = them
    ? t('impact.both', { WORD, you: words(you.after), opp, them: words(them.after) })
    : t('impact.you', { WORD, you: words(you.after) });
  return { text, tone: you.after === 1 ? 'warn' : 'neutral' };
}
