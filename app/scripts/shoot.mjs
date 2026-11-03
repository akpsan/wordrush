/**
 * Screenshot the running app (or a design mockup) at exact device sizes, for checking against the design.
 * Usage: node scripts/shoot.mjs <url> <out.png> [width] [height] [colorScheme]
 */
import { chromium } from '@playwright/test';

const [url, out, w = '390', h = '844', scheme = 'dark'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 1,
  colorScheme: scheme,
  hasTouch: Number(w) < 1000,
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: out });
await browser.close();
console.log(`saved ${out}`);
