import { expect, test } from '@playwright/test';
import { keys, openApp } from './helpers';

test.describe('physical keyboard', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: /New game/ }).click();
  });

  const turn = (page: import('@playwright/test').Page) => page.locator('.tnum');
  const count = (page: import('@playwright/test').Page) => page.locator('.actions .cnt');

  test('after clicking Flip, Enter still plays the word', async ({ page }) => {
    await keys(page, 'team');
    await page.getByRole('button', { name: /Flip to the next spot/ }).click();
    await page.keyboard.press('Enter');
    await expect(turn(page)).toHaveText('2');
  });

  test('after clicking Flip, Space flips once', async ({ page }) => {
    await keys(page, 'team');
    await page.getByRole('button', { name: /Flip to the next spot/ }).click();
    await expect(count(page)).toHaveText('2 of 2');
    await page.keyboard.press('Space');
    await expect(count(page)).toHaveText('1 of 2');
  });

  test('after closing a sheet, Enter plays instead of reopening it', async ({ page }) => {
    await keys(page, 'team');
    await page.getByRole('button', { name: 'Menu and settings' }).click();
    await page.getByRole('button', { name: 'Done' }).click();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(turn(page)).toHaveText('2');
  });

  test('a button reached with Tab takes Enter', async ({ page }) => {
    await keys(page, 'team');
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
      if (label.startsWith('Flip')) break;
    }
    await page.keyboard.press('Enter');
    await expect(count(page)).toHaveText('2 of 2');
    await expect(turn(page)).toHaveText('1');
  });

  test('Escape clears the word', async ({ page }) => {
    await keys(page, 'tea');
    await page.keyboard.press('Escape');
    await expect(page.locator('.entry')).toHaveAttribute('aria-label', 'Your word: empty');
  });
});
