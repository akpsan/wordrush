/**
 * The TypeScript engine must make exactly the same decisions as the Python simulator.
 * Replays 1,350 simulated games: before every move, the number of legal moves must match,
 * every move must be legal, and each game must end the same way.
 */

import { describe, expect, it } from 'vitest';
import everyday from '../../../../data/dictionaries/everyday-3to5.txt?raw';
import { HEX_RULES, HEX_TWO_WAY_RULES, createLexicon, legalMoves, newGame, parseWordList, play, type Dir, type GameState, type Placement, type Rules } from '..';
import fixture from './fixtures/sim-games.json';
import hexFixture from './fixtures/sim-hex-games.json';
import hex2Fixture from './fixtures/sim-hex2-games.json';

interface SimGame {
  agents: string[];
  plies: [string, number | null][];
  winner: 0 | 1 | null;
  reason: string;
}

/** The simulator's direction letters (DIR_NAMES): lowercase is the same line read backwards. */
const SIM_DIRS: Record<string, Dir> = { H: 'across', V: 'down', D: 'downLeft', h: 'left', v: 'up', d: 'upRight' };

function decode(text: string, size: number): Placement {
  const [word, pos] = text.split('@') as [string, string];
  const [r, c, d] = pos.split(',') as [string, string, string];
  return {
    word,
    row: Number(r),
    col: Number(c),
    dir: SIM_DIRS[d]!,
    anchor: Number(r) * size + Number(c),
    anchorAt: 'start',
  };
}

function replayAll(games: SimGame[], rules: Rules, lex: ReturnType<typeof createLexicon>) {
  for (const [g, sim] of games.entries()) {
    let state: GameState = newGame(rules);
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
}

describe('conformance with the Python simulator', () => {
  // The simulator played these games with the everyday list.
  const lex = createLexicon(parseWordList(everyday));
  const games = (fixture as unknown as { games: SimGame[] }).games;

  it('has games to replay', () => expect(games.length).toBeGreaterThan(1000));

  // 1,350 full games: give it time on a busy machine.
  it('replays every game with identical decisions', { timeout: 60_000 }, () => replayAll(games, newGame().rules, lex));

  // Hex mode: 160 games under the simulator's HEX preset (sim/scripts/export_hex_conformance.py).
  it('replays hex games with identical decisions', { timeout: 60_000 }, () => {
    const hex = hexFixture as unknown as { n: number; games: SimGame[] };
    expect(hex.n).toBe(HEX_RULES.size);
    expect(hex.games.length).toBe(160);
    replayAll(hex.games, HEX_RULES, lex);
  });

  // Any-direction words: 80 games under the simulator's HEX2 preset (export_hex_conformance.py HEX2).
  it('replays two-way hex games with identical decisions', { timeout: 60_000 }, () => {
    const hex2 = hex2Fixture as unknown as { rules: string; n: number; games: SimGame[] };
    expect(hex2.rules).toBe('HEX2');
    expect(hex2.n).toBe(HEX_TWO_WAY_RULES.size);
    expect(hex2.games.length).toBe(80);
    // The fixture must exercise backwards words, or this test proves nothing.
    expect(hex2.games.some((g) => g.plies.some(([m]) => /,[hvd]$/.test(m)))).toBe(true);
    replayAll(hex2.games, HEX_TWO_WAY_RULES, lex);
  });
});
