/** Runs a game: the session reducer plus the derived entry view. */

import { useMemo, useReducer } from 'react';
import type { GameState, Lexicon } from '../../engine';
import { entryView } from './model/entry';
import { createSession, sessionReducer } from './model/session';

export function useGame(lex: Lexicon, initial?: GameState) {
  const reducer = useMemo(() => sessionReducer(lex), [lex]);
  const [session, dispatch] = useReducer(reducer, initial, createSession);
  const entry = useMemo(() => entryView(session, lex), [session, lex]);
  return { session, entry, dispatch };
}
