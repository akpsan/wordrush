/** Hex mode: the default board for new games. Words run along all three lines, either way (two-way words). */
import { expect, test } from '@playwright/test';
import { keys, openApp } from './helpers';

test('hex board: 91 cells, a corner start, and a full turn each', async ({ page }) => {
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await expect(page.locator('.hexslot')).toHaveCount(91);
  await expect(page.locator('.pl.a')).toContainText('3+ words to play');
  expect(await page.locator('.hexslot[class*=heat]').count()).toBeGreaterThan(0); // the heatmap around Blue's corner
  await keys(page, 'tea\n');
  await expect(page.getByLabel('Row 1, column 6: T, Blue')).toBeVisible();
  await keys(page, 'stone\n');
  await expect(page.locator('.tnum')).toHaveText('3');
  await page.reload();
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(page.locator('.hexslot')).toHaveCount(91);
  await expect(page.locator('.tnum')).toHaveText('3');
});

test('the Board setting switches new games to the square board', async ({ page }) => {
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Board' }).getByRole('button', { name: 'Square' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await expect(page.locator('.hexslot')).toHaveCount(0);
  await expect(page.locator('.board .cell')).toHaveCount(64);
});

test('vs AI on the hex board: the AI answers', async ({ page }) => {
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await keys(page, 'tea\n');
  await expect(page.locator('p.fb')).toHaveText(/^Juno played [A-Z]+\./, { timeout: 15_000 });
  await expect(page.locator('.hexslot')).toHaveCount(91);
});

test('Learn to play on the hexagon: TEA to the box-in win', async ({ page }) => {
  await openApp(page, 'new', { board: 'hex' });
  await page.getByRole('button', { name: /Learn to play/ }).click();
  await page.getByRole('button', { name: "Let's go" }).click();
  await expect(page.locator('.hexslot')).toHaveCount(91);
  await keys(page, 'tea\n');
  await page.getByRole('button', { name: 'Your turn' }).click();
  await keys(page, 'arm');
  const fits = page.getByRole('status').filter({ hasText: 'ARM fits!' });
  for (let i = 0; i < 3 && !(await fits.isVisible()); i++) await keys(page, ' ');
  await expect(fits).toBeVisible();
  await keys(page, '\n');
  await page.getByRole('button', { name: 'Your turn' }).click();
  await keys(page, 'car\nsea');
  await expect(page.getByRole('status').filter({ hasText: 'your own C is in the way' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it' }).click();
  await keys(page, 'race\n');
  await expect(page.getByText('Boxed in', { exact: true })).toBeVisible();
});

test('two-way words: SEA can come up onto your A, with an arrow showing the way', async ({ page }) => {
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'tea\n');
  await keys(page, 'stone\n');
  // One-way, nothing could end on TEA's A. Two-way, SEA reads right to left or upwards onto it.
  await keys(page, 'sea');
  await expect(page.getByRole('status').filter({ hasText: 'SEA fits · spot 1 of 3' })).toBeVisible();
  await expect(page.locator('.ar').first()).toHaveText(/^[←↖↗]$/);
  await keys(page, '\n');
  await expect(page.getByLabel(/: S, Blue$/)).toBeVisible();
  await expect(page.locator('.tnum')).toHaveText('4');
});

test('the board stays put while typing: stepper, next spot and errors', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'phone layout');
  await page.setViewportSize({ width: 390, height: 664 }); // a phone browser with its toolbars showing
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'tea\n');
  await keys(page, 'stone\n');
  const top = async () => (await page.locator('.board').first().boundingBox())!.y;
  const start = await top();
  await keys(page, 'sea'); // three spots: the stepper replaces the feedback line
  await expect(page.locator('.stepper')).toBeVisible();
  expect(await top()).toBe(start);
  await keys(page, ' ');
  expect(await top()).toBe(start);
  for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace');
  await keys(page, 'zzz\n'); // an error line
  await expect(page.locator('.fb.err')).toBeVisible();
  expect(await top()).toBe(start);
});
