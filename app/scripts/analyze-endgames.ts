/**
 * When is a game really decided? Finds the point where the eventual loser is doomed: even if the
 * opponent never moved again, they could play at most a few more words (their "room", a solo search
 * to HORIZON words). Opponent moves only ever take room away, so from there the loss is certain and
 * the remaining moves are decorative. Then asks who caused it: the loser's own word (a self-box) or
 * the opponent's, and whether the loser had a move that kept their room open.
 *
 * Usage (from app/): npx vite-node scripts/analyze-endgames.ts [gamesPerPairing=20]
 * Games: the simulator's two-way hex games (conformance fixture) and fresh games between the app's AIs.
 */

import everyday from '../../data/dictionaries/everyday-3to5.txt?raw';
import fixture from '../src/engine/__tests__/fixtures/sim-hex2-games.json';
import { chooseMove, createRng, type Level } from '../src/ai';
import { getHintWords, getLexicon } from '../src/dictionary';
import { HEX_TWO_WAY_RULES, createLexicon, legalMoves, newGame, parseWordList, play, type Dir, type GameState, type Lexicon, type Placement, type Player } from '../src/engine';

const HORIZON = 3;
/** At a self-box, how many of the loser's other moves to check for one that kept their room open. */
const SAMPLE = 30;
const SIM_DIRS: Record<string, Dir> = { H: 'across', V: 'down', D: 'downLeft', h: 'left', v: 'up', d: 'upRight' };

const memo = new Map<string, number>();

/** How many more words `p` could play in a row, alone on this board (capped at HORIZON). */
function room(state: GameState, lex: Lexicon, p: Player, depth = 0): number {
  if (depth >= HORIZON) return 0;
  const last = state.lastWord[p];
  const key = `${depth}|${last === null ? '' : state.words[last]!.cells.join(',')}|${state.board.map((c) => (c ? c.letter : '.')).join('')}`;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  const s: GameState = { ...state, toMove: p, result: null };
  let best = 0;
  // Longest words first: they reach furthest, so a free position shows its room quickly.
  const moves = legalMoves(s, lex, p).sort((a, b) => b.word.length - a.word.length);
  for (const m of moves) {
    const after = play(s, lex, m);
    best = Math.max(best, 1 + room({ ...after, result: null }, lex, p, depth + 1));
    if (best >= HORIZON - depth) break;
  }
  memo.set(key, best);
  return best;
}

interface Analysis {
  plies: number;
  loser: Player;
  /** Plies played after the loser became doomed (room < HORIZON), up to the end. */
  decorative: number;
  /** Who made the move that doomed the loser. */
  cause: 'self' | 'opponent' | 'start' | 'never';
  /** For a self-box: the loser's moves at that turn that would have kept their room open. */
  openAlternatives: number;
  movesAtThatTurn: number;
  /** The loser's room just before the dooming move was made. */
  wordsLeft: number;
}

function analyze(moves: Placement[], lex: Lexicon): Analysis {
  const states: GameState[] = [newGame(HEX_TWO_WAY_RULES)];
  for (const m of moves) states.push(play(states.at(-1)!, lex, m));
  const end = states.at(-1)!;
  const loser: Player = end.result!.winner === 0 ? 1 : 0;
  // First ply index i (state after i moves) from which the loser stays doomed to the end.
  let doomedFrom = -1;
  for (let i = states.length - 1; i >= 0; i--) {
    const s = states[i]!;
    if (s.lastWord[loser] === null) break; // no word yet: room isn't defined
    if (room(s, lex, loser) >= HORIZON) break;
    doomedFrom = i;
  }
  const base = { plies: moves.length, loser, openAlternatives: 0, movesAtThatTurn: 0, wordsLeft: 0 };
  if (doomedFrom < 0) return { ...base, decorative: 0, cause: 'never' };
  const decorative = moves.length - doomedFrom;
  if (doomedFrom === 0) return { ...base, decorative, cause: 'start' };
  const before = states[doomedFrom - 1]!;
  const mover = before.toMove;
  const wordsLeft = room(states[doomedFrom]!, lex, loser);
  if (mover !== loser) return { ...base, decorative, cause: 'opponent', wordsLeft };
  // A self-box: which of the loser's moves at that turn would have kept their room open?
  const options = legalMoves(before, lex);
  const step = Math.max(1, Math.floor(options.length / SAMPLE));
  const sampled = options.filter((_, k) => k % step === 0).slice(0, SAMPLE);
  const open = sampled.filter((m) => {
    const after = play(before, lex, m);
    return after.result?.winner === loser || room({ ...after, result: null }, lex, loser) >= HORIZON;
  }).length;
  return { ...base, decorative, cause: 'self', openAlternatives: open, movesAtThatTurn: sampled.length, wordsLeft };
}

function decode(text: string, size: number): Placement {
  const [word, pos] = text.split('@') as [string, string];
  const [r, c, d] = pos.split(',') as [string, string, string];
  return { word, row: Number(r), col: Number(c), dir: SIM_DIRS[d]!, anchor: Number(r) * size + Number(c), anchorAt: 'start' };
}

function aiGame(a: Level, b: Level, seed: number, lex: Lexicon, familiar: ReadonlySet<string>): Placement[] {
  const rng = createRng(seed);
  let s = newGame(HEX_TWO_WAY_RULES);
  const moves: Placement[] = [];
  while (!s.result) {
    const m = chooseMove(s.toMove === 0 ? a : b, s, { lex, familiar, rng })!;
    moves.push(m);
    s = play(s, lex, m);
  }
  return moves;
}

function report(label: string, rows: Analysis[]) {
  const n = rows.length;
  const pct = (k: number) => `${Math.round((100 * k) / n)}%`;
  const by = (c: Analysis['cause']) => rows.filter((r) => r.cause === c);
  const self = by('self');
  const dec = rows.map((r) => r.decorative).sort((x, y) => x - y);
  const avoidable = self.filter((r) => r.openAlternatives > 0);
  const mean = (xs: number[]) => (xs.length ? (xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(1) : '-');
  console.log(
    `| ${label} | ${n} | ${mean(rows.map((r) => r.plies))} | ${mean(dec)} | ${dec[Math.floor(n / 2)]} | ${pct(rows.filter((r) => r.decorative >= 2).length)} | ${pct(self.length)} | ${pct(by('opponent').length)} | ${pct(avoidable.length)} | ${self.length ? mean(avoidable.map((r) => (100 * r.openAlternatives) / r.movesAtThatTurn)) + '%' : '-'} |`,
  );
}

const perPairing = Number(process.argv[2] ?? 20);
console.log(`Doomed = could play at most ${HORIZON - 1} more words even if the opponent never moved again.\n`);
console.log('| Games | n | Avg moves | Avg moves after doomed | Median | ≥2 decorative | Self-boxed | Boxed by opponent | Self-box with a way out | Share of moves that kept room open |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');

const simLex = createLexicon(parseWordList(everyday));
const sim = (fixture as unknown as { games: { agents: string[]; plies: [string, number | null][] }[] }).games;
for (const pair of ['balanced,balanced', 'greedy,aggressive', 'aggressive,random', 'random,greedy']) {
  const games = sim.filter((g) => g.agents.join(',') === pair);
  const rows = games.map((g, k) => {
    memo.clear();
    const r = analyze(g.plies.filter(([m]) => m !== 'STUCK').map(([m]) => decode(m, HEX_TWO_WAY_RULES.size)), simLex);
    console.error(`  sim ${pair} #${k}: ${JSON.stringify(r)}`);
    return r;
  });
  report(`sim ${pair.replace(',', ' vs ')}`, rows);
}

const lex = getLexicon();
const familiar = getHintWords();
for (const [a, b] of [['medium', 'medium'], ['hard', 'hard'], ['medium', 'hard']] as [Level, Level][]) {
  const rows: Analysis[] = [];
  for (let i = 0; i < perPairing; i++) {
    const [x, y] = i % 2 ? [b, a] : [a, b];
    memo.clear();
    const r = analyze(aiGame(x, y, 500 + i, lex, familiar), lex);
    console.error(`  app ${x} vs ${y} #${i}: ${JSON.stringify(r)}`);
    rows.push(r);
  }
  report(`app ${a} vs ${b}`, rows);
}
