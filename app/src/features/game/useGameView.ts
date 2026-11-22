/** Everything the game screen shows that follows from the session: derived once here, so the screen only assembles. */

import { useDeferredValue, useMemo } from 'react';
import type { GameResult, GameState, Lexicon } from '../../engine';
import type { Settings } from '../settings';
import { boardView, type CellView } from './model/board';
import type { EntryView } from './model/entry';
import { aiTurnView, feedbackFor, type AiTurnView, type Feedback } from './model/feedback';
import { hintView, type HintView } from './model/hint';
import { impactLine } from './model/impact';
import { isAi, type Match } from './model/match';
import { hintsLeft, type Session } from './model/session';
import { letterChoices, playerStatus, type PlayerStatus } from './model/status';
import { AI_LETTER_MS, type AiPhase } from './useAiTurn';

export type GameStage = 'playing' | 'boxed' | 'over';

export interface GameView {
  readonly game: GameState;
  readonly match: Match;
  readonly result: GameResult | null;
  /** 'playing' (including while the AI's winning word appears), 'boxed' (boxed-in panel) or 'over' (results). */
  readonly stage: GameStage;
  readonly playing: boolean;
  /** The person can act: playing, the AI is idle and it is a human's turn. */
  readonly yourTurn: boolean;
  readonly players: readonly [PlayerStatus, PlayerStatus];
  readonly cells: CellView[];
  readonly feedback: Feedback;
  readonly aiTurn: AiTurnView | null;
  readonly hint: HintView | null;
  /** Hints remaining, or null when the game has none. */
  readonly hintsLeft: number | null;
  readonly impact: ReturnType<typeof impactLine>;
  readonly highlight: ReadonlySet<string>;
}

export function useGameView(
  session: Session,
  entry: EntryView,
  lex: Lexicon,
  phase: AiPhase,
  settings: Settings,
): GameView {
  const { game, match } = session;
  const result = game.result;
  // While the AI's word appears, the game carries on looking like play, even if that word won.
  const stage: GameStage =
    !result || phase === 'playing' ? 'playing' : result.reason === 'boxed-in' && !session.resultsShown ? 'boxed' : 'over';
  const playing = stage === 'playing';
  const aiBusy = phase !== 'idle';
  const yourTurn = playing && !aiBusy && !isAi(match, game.toMove);
  const lastPlayByAi = session.lastPlay !== null && isAi(match, game.words[session.lastPlay.wordIndex]!.player);

  const players = useMemo(
    () => [playerStatus(session, lex, 0), playerStatus(session, lex, 1)] as const,
    [session, lex],
  );
  const cells = useMemo(
    () =>
      boardView(session, entry, lex, {
        showWaysOut: settings.showWaysOut && !aiBusy,
        showAnchors: !aiBusy,
        fade: !settings.showAllLetters,
        aiReveal: lastPlayByAi ? (phase === 'playing' ? AI_LETTER_MS : 0) : undefined,
        heat: settings.showHeatmap && yourTurn,
      }),
    [session, entry, lex, settings.showWaysOut, settings.showAllLetters, settings.showHeatmap, yourTurn, aiBusy, lastPlayByAi, phase],
  );
  const feedback = useMemo(() => feedbackFor(session, entry, lex), [session, entry, lex]);
  const aiTurn = useMemo(() => (phase === 'idle' ? null : aiTurnView(session, lex, phase)), [session, lex, phase]);
  const hint = useMemo(() => hintView(session), [session]);
  const left = session.hints.perGame > 0 ? hintsLeft(session) : null;
  // What the ready word does to both players' ways out (docs/ui-decisions.md, word impact). It also checks
  // for a dead end, which can take a moment on a phone, so it follows the typing instead of holding it up.
  const deferredSession = useDeferredValue(session);
  const deferredEntry = useDeferredValue(entry);
  const impact = useMemo(
    () => (yourTurn && deferredSession === session ? impactLine(deferredSession, deferredEntry, lex) : null),
    [yourTurn, session, deferredSession, deferredEntry, lex],
  );
  const highlight = useMemo(
    () => new Set(yourTurn && settings.highlightLetters ? letterChoices(game, game.toMove) : []),
    [yourTurn, settings.highlightLetters, game],
  );

  return { game, match, result, stage, playing, yourTurn, players, cells, feedback, aiTurn, hint, hintsLeft: left, impact, highlight };
}
