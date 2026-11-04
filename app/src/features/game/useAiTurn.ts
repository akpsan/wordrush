/**
 * Runs the AI's turn, with the timing from the design's dev notes:
 *
 * 1. Thinking: at least 0.8s (Easy), 1.0s (Medium) or 1.4s (Hard), ±150ms so it never feels
 *    mechanical. If the search takes longer, it waits for it (Hard has its own ~2.5s budget).
 * 2. Playing: the word is on the board and its new letters pop in 180ms apart.
 * 3. A ~300ms settle, then it's the person's turn.
 *
 * Under reduced motion: a short static "thinking" (0.6s), then the word appears at once.
 * Tapping the board while the word appears finishes it straight away (`skip`).
 * The move itself is an ordinary session action, so the rules stay in the engine.
 */

import { useCallback, useEffect, useState, type Dispatch } from 'react';
import { askAi, createRng, toRecords, type Level } from '../../ai';
import { isAi } from './model/match';
import type { Session, SessionAction } from './model/session';

export type AiPhase = 'idle' | 'thinking' | 'playing';

const MIN_THINK_MS: Record<Level, number> = { easy: 800, medium: 1000, hard: 1400 };
const JITTER_MS = 150;
const REDUCED_THINK_MS = 600;
export const AI_LETTER_MS = 180;
const SETTLE_MS = 300;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAiTurn(session: Session, dispatch: Dispatch<SessionAction>, reducedMotion: boolean) {
  const { game, match } = session;
  const aiToMove = !game.result && isAi(match, game.toMove);
  const [phase, setPhase] = useState<AiPhase>(aiToMove ? 'thinking' : 'idle');

  // 1. Think, then play.
  useEffect(() => {
    if (!aiToMove || match.mode !== 'ai') return;
    let cancelled = false;
    setPhase('thinking');
    const seed = match.seed + game.turn;
    const jitter = (createRng(seed)() * 2 - 1) * JITTER_MS;
    const minimum = reducedMotion ? REDUCED_THINK_MS : MIN_THINK_MS[match.level] + jitter;
    Promise.all([askAi({ level: match.level, moves: toRecords(game), seed }), wait(minimum)]).then(([move]) => {
      if (cancelled || !move) return;
      dispatch({ type: 'aiPlay', move });
      setPhase('playing');
    });
    return () => {
      cancelled = true;
    };
  }, [aiToMove, game, match, dispatch, reducedMotion]);

  // 2–3. Let the word appear, settle, then hand over.
  const newLetters = session.lastPlay?.gain ?? 0;
  useEffect(() => {
    if (phase !== 'playing') return;
    const ms = reducedMotion ? SETTLE_MS : newLetters * AI_LETTER_MS + SETTLE_MS;
    const timer = setTimeout(() => setPhase('idle'), ms);
    return () => clearTimeout(timer);
  }, [phase, newLetters, reducedMotion]);

  const skip = useCallback(() => setPhase((p) => (p === 'playing' ? 'idle' : p)), []);
  return { phase, skip };
}
