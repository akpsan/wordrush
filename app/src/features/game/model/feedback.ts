/** The one-line feedback under the entry tiles. Rules from the design's feedback-line notes. */

import { listLetters, plain, t } from '../../../copy';
import { otherPlayer, type Lexicon, type Player, type Problem } from '../../../engine';
import type { Level } from '../../../ai';
import type { EntryView } from './entry';
import { aiParams, nameOf } from './match';
import type { Session } from './session';
import { letterChoices, wordsFor } from './status';

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

  const { match } = s;
  const opponent = otherPlayer(mover);
  if (firstMove) {
    if (match.mode === 'ai' && match.first === 'random' && game.turn === 1) return neutral(t('cpu.random.result.blue'));
    return neutral(mover === 0 ? t('first.start.blue') : t('first.start.orange'));
  }
  if (wordsFor(game, lex, mover) === 1) return { tone: 'warn', text: t('type.danger'), pip: null };
  if (game.lastWord[opponent] !== null && wordsFor(game, lex, opponent) === 1) {
    const text = match.mode === 'ai' ? t('cpu.danger.them', aiParams(match)) : t('opp.danger.them', { player: nameOf(match, opponent) });
    return neutral(text, opponent);
  }
  const last = game.words[game.words.length - 1];
  if (s.lastPlay && last && last.player === opponent) {
    const WORD = last.word.toUpperCase();
    const text =
      match.mode === 'ai'
        ? t('cpu.played', { ...aiParams(match), WORD, letters })
        : t('type.start.afterOpp', { opponent: nameOf(match, opponent), WORD, letters });
    return neutral(text, last.player);
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

/** What the entry area shows while the AI takes its turn: a line in place of the tiles, and a note under it. */
export interface AiTurnView {
  readonly line: string;
  /** The animated dots while it thinks. */
  readonly dots: boolean;
  readonly ai: Player;
  readonly level: Level;
  readonly note: Feedback | null;
}

export function aiTurnView(s: Session, lex: Lexicon, phase: 'thinking' | 'playing'): AiTurnView | null {
  const { game, match } = s;
  if (match.mode !== 'ai') return null;
  const ai = otherPlayer(match.human);
  const params = aiParams(match);
  const aiWord = game.lastWord[ai] !== null ? game.words[game.lastWord[ai]!]!.word.toUpperCase() : '';
  const line =
    phase === 'playing'
      ? t('cpu.playing', { ...params, WORD: aiWord })
      : game.lastWord[ai] !== null && wordsFor(game, lex, ai) === 1
        ? t('cpu.thinking.danger', params)
        : t('cpu.thinking', params);
  // Under the line: the coin flip on a Random start, or the person's last word.
  const mine = game.lastWord[match.human];
  let note: Feedback | null = null;
  if (mine === null && match.first === 'random') note = neutral(t('cpu.random.result.orange', params));
  else if (mine !== null) {
    const WORD = game.words[mine]!.word.toUpperCase();
    const justPlayed = phase === 'thinking' && s.lastPlay?.wordIndex === mine;
    note = neutral(
      justPlayed ? t('wait.youPlayed', { WORD, n: s.lastPlay!.gain }) : t('wait.theyPlayed', { player: t('player.you'), WORD }),
      match.human,
    );
  }
  return { line, dots: phase === 'thinking', ai, level: match.level, note };
}

/** What screen readers hear during a vs-AI game (one polite message per step). */
export function aiAnnouncement(s: Session, phase: 'idle' | 'thinking' | 'playing'): string {
  const { game, match } = s;
  if (match.mode !== 'ai' || game.result) return '';
  const ai = otherPlayer(match.human);
  const params = aiParams(match);
  if (phase === 'thinking') return plain('cpu.sr.thinking', params);
  const last = game.lastWord[ai] !== null ? game.words[game.lastWord[ai]!]! : null;
  if (phase === 'playing' && last) {
    return plain('cpu.sr.played', { ...params, WORD: last.word.toUpperCase(), 'across/down': last.dir, r: last.row + 1, c: last.col + 1 });
  }
  if (phase === 'idle' && last && s.lastPlay && game.words[s.lastPlay.wordIndex] === last) {
    return plain('cpu.sr.yourturn', { letters: listLetters(letterChoices(game, match.human)) });
  }
  return '';
}
