/**
 * Calibrates the AI levels: plays them against each other and against a "novice" stand-in for a
 * person with a small vocabulary (a random everyday word each turn). Pairs of games share a seed
 * with sides swapped, so neither side gets the first-move edge. Also reports thinking time.
 *
 * Usage (from app/): npx vite-node scripts/calibrate-ai.ts [gamesPerPairing=100] [level]
 * With a level, only the pairings that include it are played.
 */

import { chooseMove, createRng, type Level, type Rng } from '../src/ai';
import { getHintWords, getLexicon } from '../src/dictionary';
import { legalMoves, newGame, play, type GameState, type Placement } from '../src/engine';

type Side = Level | 'novice';

const lex = getLexicon();
const familiar = getHintWords();
const games = Number(process.argv[2] ?? 100);
const only = process.argv[3] as Side | undefined;
const times: Record<Side, number[]> = { novice: [], easy: [], medium: [], hard: [] };

function novice(state: GameState, rng: Rng): Placement | null {
  const all = legalMoves(state, lex);
  const everyday = all.filter((m) => familiar.has(m.word));
  const moves = everyday.length ? everyday : all;
  return moves.length ? moves[Math.floor(rng() * moves.length)]! : null;
}

function playGame(blue: Side, orange: Side, seed: number): { winner: 0 | 1; turns: number } {
  const rng = createRng(seed);
  let state = newGame();
  while (!state.result) {
    const side = state.toMove === 0 ? blue : orange;
    const t0 = performance.now();
    const move = side === 'novice' ? novice(state, rng) : chooseMove(side, state, { lex, familiar, rng });
    times[side].push(performance.now() - t0);
    if (!move) throw new Error('no move but the game is not over');
    state = play(state, lex, move);
  }
  return { winner: state.result.winner, turns: state.words.length };
}

function wilson(wins: number, n: number): [number, number] {
  const z = 1.96;
  const p = wins / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [c - h, c + h];
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const pairings: [Side, Side][] = [
  ['easy', 'novice'],
  ['medium', 'novice'],
  ['hard', 'novice'],
  ['medium', 'easy'],
  ['hard', 'easy'],
  ['hard', 'medium'],
];

console.log(`| Pairing | Games | First side wins | 95% CI | Blue wins | Avg words |`);
console.log(`| --- | --- | --- | --- | --- | --- |`);
for (const [x, y] of pairings.filter((p) => !only || p.includes(only))) {
  let xWins = 0;
  let blueWins = 0;
  let words = 0;
  for (let i = 0; i < games / 2; i++) {
    const seed = 1000 + i;
    const a = playGame(x, y, seed); // x is Blue
    const b = playGame(y, x, seed); // x is Orange
    xWins += (a.winner === 0 ? 1 : 0) + (b.winner === 1 ? 1 : 0);
    blueWins += (a.winner === 0 ? 1 : 0) + (b.winner === 0 ? 1 : 0);
    words += a.turns + b.turns;
  }
  const [lo, hi] = wilson(xWins, games);
  console.log(
    `| ${x} vs ${y} | ${games} | ${pct(xWins / games)} | ${pct(lo)}–${pct(hi)} | ${pct(blueWins / games)} | ${(words / games).toFixed(1)} |`,
  );
}

console.log('\n| Level | Moves timed | Median ms | 95th percentile ms | Max ms |');
console.log('| --- | --- | --- | --- | --- |');
for (const side of ['easy', 'medium', 'hard'] as const) {
  const t = [...times[side]].sort((a, b) => a - b);
  const q = (p: number) => Math.round(t[Math.min(t.length - 1, Math.floor(p * t.length))] ?? 0);
  console.log(`| ${side} | ${t.length} | ${q(0.5)} | ${q(0.95)} | ${q(1 - 1e-9)} |`);
}
