/**
 * Automated accessibility checks (WCAG 2.1 A and AA) on every main screen, in both themes.
 * axe-core can't catch everything; keyboard behaviour is covered in keyboard.spec.ts.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { BOX_IN_GAME, keys, openApp } from './helpers';

async function scan(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.help}\n   e.g. ${v.nodes[0]?.target.join(' ')}`);
  expect(summary, `${label}\n${summary.join('\n')}`).toEqual([]);
}

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    test('menu, first launch and returning', async ({ page }) => {
      await openApp(page, 'new', { theme });
      await scan(page, 'menu (first launch)');
      await openApp(page, 'returning', { theme });
      await page.getByRole('button', { name: /New game/ }).click();
      await keys(page, 'team\n');
      await page.getByRole('button', { name: 'Menu and settings' }).click();
      await page.getByRole('button', { name: 'Back to menu' }).click();
      await scan(page, 'menu (returning, with Continue)');
      await page.getByRole('button', { name: 'Settings' }).click();
      await scan(page, 'menu settings sheet');
    });

    test('game: typing, sheets, boxed in, results', async ({ page }) => {
      await openApp(page, 'returning', { theme, hints: 3 });
      await page.getByRole('button', { name: /New game/ }).click();
      await scan(page, 'game (first move)');
      await keys(page, 'team\nstone\nma');
      await scan(page, 'game (typing)');
      await keys(page, 'q\n');
      await scan(page, 'game (a word that does not work)');
      await page.getByRole('button', { name: /Get a hint/ }).click();
      await scan(page, 'game (hint showing)');
      await page.getByRole('button', { name: 'Menu and settings' }).click();
      await scan(page, 'game settings sheet');
      await page.getByRole('button', { name: 'Done' }).click();
      await page.getByRole('button', { name: 'Give up' }).click();
      await scan(page, 'give up sheet');
      await openApp(page, 'returning', { theme });
      await page.getByRole('button', { name: /New game/ }).click();
      await keys(page, BOX_IN_GAME);
      await scan(page, 'boxed in');
      await page.getByRole('button', { name: 'See results' }).click();
      await scan(page, 'results');
    });

    test('Learn to play', async ({ page }) => {
      await openApp(page, 'new', { theme });
      await page.getByRole('button', { name: /Learn to play/ }).click();
      await scan(page, 'tutorial intro');
      await page.getByRole('button', { name: "Let's go" }).click();
      await keys(page, 'te');
      await scan(page, 'tutorial typing');
      await keys(page, 'xx');
      await scan(page, 'tutorial off-script');
      await page.getByRole('button', { name: 'Skip' }).click();
      await scan(page, 'tutorial skip sheet');
    });
  });
}
