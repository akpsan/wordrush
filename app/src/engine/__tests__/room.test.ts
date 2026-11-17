import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { HEX_TWO_WAY_RULES, legalMoves, newGame, play, roomOf, type GameState, type Player } from '..';

const lex = getLexicon();

/** Plain reference: the longest chain of the player's own words, up to `horizon`, no shortcuts. */
function reference(state: GameState, p: Player, horizon: number): number {
  if (horizon === 0) return 0;
  const s = { ...state, toMove: p, result: null };
  let best = 0;
  for (const m of legalMoves(s, lex, p)) {
    best = Math.max(best, 1 + reference({ ...play(s, lex, m), result: null }, p, horizon - 1));
    if (best === horizon) break;
  }
  return best;
}

/** Positions from deterministic games that play the shortest words, so dead ends show up late. */
function positions(): { state: GameState; player: Player }[] {
  const out: { state: GameState; player: Player }[] = [];
  for (let g = 0; g < 3; g++) {
    let s = newGame(HEX_TWO_WAY_RULES);
    while (!s.result) {
      const moves = legalMoves(s, lex).sort((a, b) => a.word.length - b.word.length || a.word.localeCompare(b.word));
      s = play(s, lex, moves[(g * 7 + s.turn * 3) % Math.min(moves.length, 5)]!);
      for (const player of [0, 1] as const) if (s.lastWord[player] !== null) out.push({ state: s, player });
    }
  }
  return out;
}

describe('room', () => {
  it('matches a plain search on real positions, including dead ends', { timeout: 60_000 }, () => {
    const all = positions();
    const rooms = all.map(({ state, player }) => roomOf(state, lex, player, 3, Infinity));
    all.forEach(({ state, player }, i) => expect(rooms[i], `position ${i}`).toBe(reference(state, player, 3)));
    expect(rooms.some((r) => r < 3)).toBe(true); // the games reach dead ends, or this proves little
  });

  it('answers "open" when its budget runs out, so a short answer is always proven', () => {
    let s = newGame(HEX_TWO_WAY_RULES);
    s = play(s, lex, legalMoves(s, lex)[0]!);
    expect(roomOf(s, lex, 0, 3, 1)).toBe(3);
  });
});
