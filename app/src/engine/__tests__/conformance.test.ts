/**
 * The TypeScript engine must make exactly the same decisions as the Python simulator.
 * Replays 1,350 simulated games: before every move, the number of legal moves must match,
 * every move must be legal, and each game must end the same way.
 */

import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { legalMoves, newGame, play, type GameState, type Placement } from '..';
import fixture from './fixtures/sim-games.json';

interface SimGame {
  agents: string[];
  plies: [string, number | null][];
  winner: 0 | 1 | null;
  reason: string;
}

function decode(text: string, size: number): Placement {
  const [word, pos] = text.split('@') as [string, string];
  const [r, c, d] = pos.split(',') as [string, string, string];
  return {
    word,
    row: Number(r),
    col: Number(c),
    dir: d === 'H' ? 'across' : 'down',
    anchor: Number(r) * size + Number(c),
    anchorAt: 'start',
  };
}

describe('conformance with the Python simulator', () => {
  const lex = getLexicon();
  const games = (fixture as unknown as { games: SimGame[] }).games;

  it('has games to replay', () => expect(games.length).toBeGreaterThan(1000));

  it('replays every game with identical decisions', () => {
    for (const [g, sim] of games.entries()) {
      let state: GameState = newGame();
      for (const [move, nLegal] of sim.plies) {
        if (move === 'STUCK') break;
        if (nLegal !== null) {
          expect(legalMoves(state, lex).length, `game ${g}, turn ${state.turn}`).toBe(nLegal);
        }
        state = play(state, lex, decode(move, state.rules.size));
      }
      expect(state.result, `game ${g} should be over`).not.toBeNull();
      expect(state.result!.reason).toBe(sim.reason === 'cornered' ? 'boxed-in' : 'full-board');
      expect(state.result!.winner).toBe(sim.winner);
    }
  });
});
