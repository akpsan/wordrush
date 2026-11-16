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
  await expect(page.getByText(/words to play|word left/).first()).toBeVisible();
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

test('on-screen keys: a tap types once, and taps in the gaps still land', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'touch only');
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  const box = async (name: string) => (await page.locator('.kb').getByRole('button', { name, exact: true }).boundingBox())!;
  const typed = page.getByRole('textbox');
  // A plain tap on T: exactly one letter, not two (pointerdown plus the click that follows).
  const t = await box('T');
  await page.touchscreen.tap(t.x + t.width / 2, t.y + t.height / 2);
  await expect(typed).toHaveAccessibleName('Your word: T');
  // Between W and E, just right of W's edge: lands on W (the left half of the gap is W's).
  const w = await box('W');
  await page.touchscreen.tap(w.x + w.width + 1, w.y + w.height / 2);
  await expect(typed).toHaveAccessibleName('Your word: TW');
  // Left of A, in the middle row's inset: lands on A.
  const a = await box('A');
  await page.touchscreen.tap(a.x - 10, a.y + a.height / 2);
  await expect(typed).toHaveAccessibleName('Your word: TWA');
  // Just below E, in the gap between the top two rows: lands on E.
  const e = await box('E');
  await page.touchscreen.tap(e.x + e.width / 2, e.y + e.height + 1);
  await expect(typed).toHaveAccessibleName('Your word: TWAE');
  // Delete takes one letter per tap too.
  const del = await box('Delete');
  await page.touchscreen.tap(del.x + del.width / 2, del.y + del.height / 2);
  await expect(typed).toHaveAccessibleName('Your word: TWA');
});
