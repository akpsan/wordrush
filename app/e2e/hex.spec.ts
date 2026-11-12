/** Hex mode: the default board for new games. Words run across, down-right or down-left. */
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
