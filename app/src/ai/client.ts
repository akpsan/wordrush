/**
 * Ask the AI for a move. Runs in a Web Worker when the browser has one, so the screen keeps
 * animating while it thinks; otherwise (tests, very old browsers) it runs here.
 */

import { getHintWords, getLexicon } from '../dictionary';
import type { Placement } from '../engine';
import { chooseMove } from './choose';
import { replay, type AiRequest, type WorkerRequest, type WorkerResponse } from './protocol';
import { createRng } from './random';

export type { AiRequest } from './protocol';

let worker: Worker | null | undefined;
let nextId = 1;
const pending = new Map<number, (move: Placement | null) => void>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = typeof Worker === 'undefined' ? null : new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker?.addEventListener('message', (e: MessageEvent<WorkerResponse>) => {
      pending.get(e.data.id)?.(e.data.move);
      pending.delete(e.data.id);
    });
  } catch {
    worker = null;
  }
  return worker;
}

function chooseHere({ level, moves, seed }: AiRequest): Placement | null {
  const lex = getLexicon();
  return chooseMove(level, replay(moves, lex), { lex, familiar: getHintWords(), rng: createRng(seed) });
}

export function askAi(request: AiRequest): Promise<Placement | null> {
  const w = getWorker();
  if (!w) return Promise.resolve().then(() => chooseHere(request));
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    const message: WorkerRequest = { ...request, id };
    w.postMessage(message);
  });
}
