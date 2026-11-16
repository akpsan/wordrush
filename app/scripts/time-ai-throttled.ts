/**
 * Times the AI levels in a real browser with the CPU slowed down, as a stand-in for a mid-range phone.
 * Plays games between the AIs on two-way hex at full speed to collect positions, then turns on CPU
 * throttling and times each level's move on them, with Hard's 2.5s budget as in the app's worker.
 * Reports how often Hard's budget runs out (it then plays the best move found so far).
 *
 * Usage (from app/): npx vite-node scripts/time-ai-throttled.ts [throttle=4] [games=6]
 * Uses Chromium from Playwright (PW_CHROMIUM sets its path).
 */

import { chromium } from 'playwright';
import { createServer } from 'vite';

const throttle = Number(process.argv[2] ?? 4);
const games = Number(process.argv[3] ?? 6);
const BUDGET_MS = 2500; // keep in step with src/ai/worker.ts

const server = await createServer({ root: new URL('..', import.meta.url).pathname, server: { port: 5299, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
try {
  const page = await browser.newPage();
  // The page loads the app's modules itself. Defined from a string: vite-node would rewrite an import() here.
  await page.addInitScript({ content: 'window.__load = (path) => import(path);' });
  await page.goto('http://localhost:5299/');
  const cdp = await page.context().newCDPSession(page);

  // Positions: every position where an AI is to move, from games between Medium and Hard.
  const count = await page.evaluate(async (n) => {
    const load = (globalThis as unknown as { __load: (p: string) => Promise<any> }).__load; // eslint-disable-line @typescript-eslint/no-explicit-any
    const ai = await load('/src/ai/index.ts');
    const eng = await load('/src/engine/index.ts');
    const dict = await load('/src/dictionary/index.ts');
    const lex = dict.getLexicon();
    const familiar = dict.getHintWords();
    const positions: unknown[] = [];
    for (let g = 0; g < n; g++) {
      const rng = ai.createRng(900 + g);
      let s = eng.newGame(eng.HEX_TWO_WAY_RULES);
      while (!s.result) {
        if (s.lastWord[s.toMove] !== null) positions.push(s);
        s = eng.play(s, lex, ai.chooseMove(s.toMove === g % 2 ? 'hard' : 'medium', s, { lex, familiar, rng })!);
      }
    }
    (globalThis as Record<string, unknown>).__positions = positions;
    return positions.length;
  }, games);

  await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  const results = await page.evaluate(async (budget) => {
    const load = (globalThis as unknown as { __load: (p: string) => Promise<any> }).__load; // eslint-disable-line @typescript-eslint/no-explicit-any
    const ai = await load('/src/ai/index.ts');
    const dict = await load('/src/dictionary/index.ts');
    const lex = dict.getLexicon();
    const familiar = dict.getHintWords();
    const positions = (globalThis as Record<string, unknown>).__positions as Parameters<typeof ai.chooseMove>[1][];
    const out: Record<string, { ms: number[]; capped: number }> = {};
    for (const level of ['easy', 'medium', 'hard'] as const) {
      const r = (out[level] = { ms: [] as number[], capped: 0 });
      positions.forEach((s, i) => {
        let hit = false;
        const start = performance.now();
        const outOfTime = () => (performance.now() - start > budget ? (hit = true) : false);
        ai.chooseMove(level, s, { lex, familiar, rng: ai.createRng(i), outOfTime });
        r.ms.push(performance.now() - start);
        if (hit) r.capped++;
      });
    }
    return out;
  }, BUDGET_MS);

  const q = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))]!;
  console.log(`CPU throttled ${throttle}x, ${count} positions from ${games} Medium-vs-Hard games on two-way hex.\n`);
  console.log('| Level | Median ms | 90th percentile ms | Max ms | Budget ran out |');
  console.log('| --- | --- | --- | --- | --- |');
  for (const [level, r] of Object.entries(results)) {
    const cap = level === 'hard' ? `${r.capped} of ${r.ms.length} (${Math.round((100 * r.capped) / r.ms.length)}%)` : 'no budget';
    console.log(`| ${level} | ${Math.round(q(r.ms, 0.5))} | ${Math.round(q(r.ms, 0.9))} | ${Math.round(Math.max(...r.ms))} | ${cap} |`);
  }
} finally {
  await browser.close();
  await server.close();
}
