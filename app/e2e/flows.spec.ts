import { expect, test } from '@playwright/test';
import { BOX_IN_GAME, keys, openApp } from './helpers';

test('first launch: Learn to play first, through to a real game', async ({ page }) => {
  await openApp(page, 'new');
  const learn = page.getByRole('button', { name: /Learn to play/ });
  await expect(learn).toContainText('New? Start here');
  await learn.click();
  await page.getByRole('button', { name: "Let's go" }).click();
  await keys(page, 'team\n');
  await page.getByRole('button', { name: 'Your turn' }).click();
  await keys(page, 'map \n');
  await page.getByRole('button', { name: 'Your turn' }).click();
  await keys(page, 'top\n');
  await keys(page, 'cat');
  await expect(page.getByRole('status').filter({ hasText: 'your own E is in the way' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.getByText(/\d+ ways out/)).toBeVisible();
  await keys(page, 'plant\n');
  await expect(page.getByText('Boxed in', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByText("You're ready!")).toBeVisible();
  await expect(page.getByText('Your first game is against Pip')).toBeVisible();
  await page.getByRole('button', { name: 'Play vs AI' }).click();
  await expect(page.locator('.pl.cpu')).toContainText('Pip');
  await expect(page.getByText('Start in the top-left corner', { exact: false })).toBeVisible();
});

test('a full game: Blue boxes Orange in, then the results', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, BOX_IN_GAME);
  await expect(page.getByRole('alert')).toContainText('DOGS is boxed in');
  await page.getByRole('button', { name: 'See results' }).click();
  await expect(page.getByText('Blue boxed Orange in!')).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('.tnum')).toHaveText('1');
});

test('a game in progress survives a reload and continues', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'team\nstone\n');
  await page.reload();
  const cont = page.getByRole('button', { name: /Continue/ });
  await expect(cont).toContainText("Turn 3 · Blue's move");
  await cont.click();
  await expect(page.locator('.tnum')).toHaveText('3');
  await expect(page.getByLabel('Row 8, column 4: S, Orange')).toBeVisible();
});

test('giving up asks first, then the opponent wins', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'team\n');
  await page.getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByText('Orange gave up')).toBeVisible();
});

test('a word that does not work explains why, and nothing is played', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'tqx\n');
  await expect(page.getByRole('status').filter({ hasText: "isn't a word we know" })).toBeVisible();
  await expect(page.locator('.tnum')).toHaveText('1');
});

test('hints: reveal a letter, offered when giving up, counted in the results', async ({ page }) => {
  await openApp(page, 'returning', { hints: 3 });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'team\nstone\n');
  await page.getByRole('button', { name: 'Get a hint, 3 left' }).click();
  await expect(page.locator('.hintchip')).toContainText('2 left');
  await page.getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByText('Stuck? Try a hint')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByText('Hints used')).toBeVisible();
});

test('on-screen keys type and play', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  for (const letter of 'TEAM') await page.getByRole('button', { name: letter, exact: true }).click();
  await page.getByRole('button', { name: 'Play TEAM' }).click();
  await expect(page.locator('.tnum')).toHaveText('2');
});
