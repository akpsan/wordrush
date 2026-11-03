/** The one-line feedback under the entry tiles. Rules from the design's feedback-line notes. */

import { listLetters, playerName, t } from '../../../copy';
import { otherPlayer, type Lexicon, type Player, type Problem } from '../../../engine';
import type { EntryView } from './entry';
import type { Session } from './session';
import { letterChoices, waysOutFor } from './status';

/** 'steer' is the tutorial's gentle redirect when the player types something off-script. */
export type FeedbackTone = 'neutral' | 'good' | 'err' | 'warn' | 'steer';

export interface Feedback {
  readonly tone: FeedbackTone;
  /** Copy with **bold** markers. */
  readonly text: string;
  /** Show a player pip before the text (whose word is being mentioned). */
  readonly pip: Player | null;
}

const neutral = (text: string, pip: Player | null = null): Feedback => ({ tone: 'neutral', text, pip });

export function feedbackFor(s: Session, entry: EntryView, lex: Lexicon): Feedback {
  const { game } = s;
  const mover = game.toMove;
  const word = s.typed.toUpperCase();
  const letters = listLetters(letterChoices(game, mover));
  const firstMove = game.lastWord[mover] === null;

  if (s.problem) return { tone: 'err', text: problemText(s.problem.kind, word, letters), pip: null };

  switch (entry.preview.kind) {
    case 'ready': {
      const more = entry.spots.length - 1;
      const text =
        more === 0
          ? t('type.ready.one', { WORD: word })
          : more === 1
            ? t('type.ready.two', { WORD: word })
            : t('type.ready.many', { WORD: word, n: more });
      return { tone: 'good', text, pip: null };
    }
    case 'partial': {
      const n = entry.spots.length;
      return neutral(n === 1 ? t('type.partial.one') : t('type.partial', { n }));
    }
    case 'no-spot':
      return neutral(firstMove ? t('first.keepgoing') : t('type.nospot', { letters }));
    case 'empty':
      break;
  }

  if (firstMove) return neutral(mover === 0 ? t('first.start.blue') : t('first.start.orange'));
  if (waysOutFor(game, lex, mover) === 1) return { tone: 'warn', text: t('type.danger'), pip: null };
  const last = game.words[game.words.length - 1];
  if (s.lastPlay && last && last.player === otherPlayer(mover)) {
    return neutral(
      t('type.start.afterOpp', { opponent: playerName(last.player), WORD: last.word.toUpperCase(), letters }),
      last.player,
    );
  }
  return neutral(t('type.start', { letters }));
}

function problemText(problem: Problem, word: string, letters: string): string {
  switch (problem) {
    case 'too-short':
      return t('oops.short');
    case 'already-played':
      return t('oops.played', { WORD: word });
    case 'not-a-word':
      return t('oops.notword', { WORD: word });
    case 'no-room':
      return t('oops.noroom', { WORD: word });
    case 'not-your-letter':
      return t('oops.notyourletter', { letters });
  }
}
