/** Runs a game: the session reducer plus the derived entry view. Saves the game as it changes. */

import { useEffect, useMemo, useReducer } from 'react';
import type { Lexicon } from '../../engine';
import { getHintWords } from '../../dictionary';
import { entryView } from './model/entry';
import { createSession, noHints, sessionReducer } from './model/session';
import { saveGame, type SavedSession } from './persistence';

/** Start from a saved game, or a new game with this many hints per player. */
export type GameStart = { readonly saved: SavedSession } | { readonly hintsPerGame: number };

export function useGame(lex: Lexicon, start: GameStart) {
  const reducer = useMemo(() => sessionReducer(lex, getHintWords()), [lex]);
  const [session, dispatch] = useReducer(reducer, start, (st) =>
    'saved' in st ? createSession(st.saved.game, st.saved.hints) : createSession(undefined, noHints(st.hintsPerGame)),
  );
  const entry = useMemo(() => entryView(session, lex), [session, lex]);
  useEffect(() => saveGame(session.game, session.hints), [session.game, session.hints]);
  return { session, entry, dispatch };
}
