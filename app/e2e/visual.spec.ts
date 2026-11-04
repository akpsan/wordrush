/**
 * Screenshot tests: each key screen, compared with an approved image (e2e/visual.spec.ts-snapshots).
 * The approved images were checked by eye against the design mockups in design/handoff/.
 * After an intended visual change, review the new screenshots, then: npm run e2e -- --update-snapshots=all
 */
import { expect, test } from '@playwright/test';
import { BOX_IN_GAME, FADE_GAME, keys, openApp } from './helpers';

const shot = async (page: import('@playwright/test').Page, name: string) => {
  await page.waitForTimeout(150);
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: false });
};

test('menu', async ({ page }) => {
  await openApp(page, 'new');
  await shot(page, 'menu-first-launch');
});

test('game states', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await shot(page, 'game-first-move');
  await keys(page, 'team\nstone\nma');
  await shot(page, 'game-partial');
  await keys(page, 'p');
  await shot(page, 'game-ready');
  await keys(page, 'q\n');
  await shot(page, 'game-oops');
});

test('boxed in and results', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, BOX_IN_GAME);
  await shot(page, 'boxed-in');
  await page.getByRole('button', { name: 'See results' }).click();
  await shot(page, 'results');
});

test('older words fade, and the board dims while typing', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, FADE_GAME);
  await shot(page, 'game-faded');
  await keys(page, 'g');
  await shot(page, 'game-typing-dim');
});

test('Play vs AI: setup and results', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await shot(page, 'ai-setup');
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Give up' }).click();
  await shot(page, 'ai-results');
});

test('light theme game', async ({ page }) => {
  await openApp(page, 'returning', { theme: 'light' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'team\nstone\nma');
  await shot(page, 'game-light');
});

test('Learn to play', async ({ page }) => {
  await openApp(page, 'new');
  await page.getByRole('button', { name: /Learn to play/ }).click();
  await shot(page, 'learn-intro');
  await keys(page, '\nteam\n\nmap \n\ntop\ncat');
  await shot(page, 'learn-bump');
  await keys(page, '\nplant');
  await shot(page, 'learn-box-in');
});
