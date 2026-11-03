/** Runs a game: the session reducer plus the derived entry view. Saves the game as it changes. */

import { useEffect, useMemo, useReducer } from 'react';
import type { GameState, Lexicon } from '../../engine';
import { entryView } from './model/entry';
import { createSession, sessionReducer } from './model/session';
import { saveGame } from './persistence';

export function useGame(lex: Lexicon, initial?: GameState) {
  const reducer = useMemo(() => sessionReducer(lex), [lex]);
  const [session, dispatch] = useReducer(reducer, initial, createSession);
  const entry = useMemo(() => entryView(session, lex), [session, lex]);
  useEffect(() => saveGame(session.game), [session.game]);
  return { session, entry, dispatch };
}
