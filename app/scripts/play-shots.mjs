/**
 * Play a scripted game in the running app and screenshot each step.
 * Usage: node scripts/play-shots.mjs <baseUrl> <outDir> [width] [height] [colorScheme]
 * Steps are "keys" to type (lowercase letters; ' ' flips; '\n' plays; '<' deletes) and a shot name.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [url, outDir, w = '390', h = '844', scheme = 'dark'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const steps = [
  ['', '01-first-move'],
  ['tea', '02-partial'],
  ['m', '03-ready'],
  [' ', '04-flipped'],
  ['\n', '05-orange-turn'],
  ['stone', '06-orange-ready'],
  ['\n', '07-blue-chains'],
  ['rqx\n', '08-oops'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, colorScheme: scheme });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
for (const [keys, name] of steps) {
  for (const k of keys) {
    const key = k === ' ' ? 'Space' : k === '\n' ? 'Enter' : k === '<' ? 'Backspace' : k;
    await page.keyboard.press(key);
  }
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}/${name}.png` });
}
await browser.close();
console.log(`saved ${steps.length} shots to ${outDir}`);
