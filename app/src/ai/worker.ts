/// <reference lib="webworker" />
/** The AI's thread: loads the word lists once, then answers one move request at a time. */

import { getHintWords, getLexicon } from '../dictionary';
import { chooseMove } from './choose';
import { replay, type WorkerRequest, type WorkerResponse } from './protocol';
import { createRng } from './random';

const lex = getLexicon();
const familiar = getHintWords();

/** Hard stops looking further after this long, so a slow phone never waits more than about 3s. */
const BUDGET_MS = 2500;

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, level, moves, seed, shape } = e.data;
  let move = null;
  try {
    const start = performance.now();
    const outOfTime = () => performance.now() - start > BUDGET_MS;
    move = chooseMove(level, replay(moves, lex, shape), { lex, familiar, rng: createRng(seed), outOfTime });
  } catch {
    move = null;
  }
  const reply: WorkerResponse = { id, move };
  self.postMessage(reply);
};
