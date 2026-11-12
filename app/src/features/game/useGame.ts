/** Runs a game: the session reducer plus the derived entry view. Saves the game as it changes. */

import { useEffect, useMemo, useReducer } from 'react';
import { newGame, rulesFor, type Lexicon, type Shape } from '../../engine';
import { getHintWords } from '../../dictionary';
import { entryView } from './model/entry';
import type { Match } from './model/match';
import { createSession, noHints, sessionReducer } from './model/session';
import { saveGame, type SavedSession } from './persistence';

/** Start from a saved game, or a new game with this many hints per player. */
export type GameStart =
  | { readonly saved: SavedSession }
  | { readonly hintsPerGame: number; readonly match: Match; readonly shape: Shape };

export function useGame(lex: Lexicon, start: GameStart) {
  const reducer = useMemo(() => sessionReducer(lex, getHintWords()), [lex]);
  const [session, dispatch] = useReducer(reducer, start, (st) =>
    'saved' in st
      ? createSession(st.saved.game, st.saved.hints, st.saved.match)
      : createSession(newGame(rulesFor(st.shape)), noHints(st.hintsPerGame), st.match),
  );
  const entry = useMemo(() => entryView(session, lex), [session, lex]);
  useEffect(() => saveGame(session.game, session.hints, session.match), [session.game, session.hints, session.match]);
  return { session, entry, dispatch };
}
