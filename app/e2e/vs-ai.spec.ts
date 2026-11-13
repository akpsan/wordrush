/**
 * Play vs AI, end to end. The AI's words vary from game to game, so these tests check the flow
 * (setup, the AI's turn, results, records), not particular words. Runs with reduced motion.
 */
import { expect, test, type Page } from '@playwright/test';
import { keys, openApp } from './helpers';

const AI_TURN = { timeout: 15_000 };
const feedback = (page: Page) => page.locator('p.fb');
const setup = (page: Page) => page.getByRole('dialog', { name: 'Play vs AI' });

test('first time: Play vs AI opens setup; number keys pick, Enter starts, and the AI answers', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await expect(setup(page)).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Juno, Medium' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('3');
  await expect(page.getByRole('radio', { name: 'Rex, Hard' })).toHaveAttribute('aria-checked', 'true');
  await expect(setup(page)).toContainText('Rex plans ahead');
  await page.keyboard.press('Enter');
  await expect(page.locator('.pl.cpu')).toContainText('Rex');
  await expect(page.locator('.pl.cpu')).toContainText('Hard');
  await keys(page, 'team\n');
  await expect(page.locator('.typing')).toHaveText('Rex is thinking');
  await expect(feedback(page)).toHaveText(/^Rex played [A-Z]+\. Start or end with T, E, A or M/, AI_TURN);
});

test('keys pressed during the AI\'s turn are ignored, not queued', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await keys(page, 'team\nzzz');
  await page.locator('.kb').getByRole('button', { name: 'Q' }).click({ force: true });
  await expect(feedback(page)).toHaveText(/^Juno played/, AI_TURN);
  await expect(page.getByRole('textbox', { name: 'Your word: empty' })).toBeVisible();
});

test('the AI can go first, and Continue and the menu remember the game', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await setup(page).getByRole('button', { name: 'Juno', exact: true }).click();
  await expect(setup(page)).toContainText("You'll be Orange.");
  await page.getByRole('button', { name: 'Start game' }).click();
  // Juno's first word is on the board; the person's first word still has to end in the corner.
  await expect(page.locator('.cell.a').first()).toBeVisible(AI_TURN);
  await expect(feedback(page)).toHaveText('End your word in the bottom-right corner', AI_TURN);
  await expect(page.locator('.pl.b')).toContainText('You');
  await page.getByRole('button', { name: 'Menu and settings' }).click();
  await page.getByRole('button', { name: 'Back to menu' }).click();
  await expect(page.getByRole('button', { name: /Continue/ })).toContainText('vs Juno (Medium) · Turn 2 · your move');
  await expect(page.getByRole('button', { name: /Play vs AI/ })).toContainText('Juno · Medium · Juno goes first');
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(feedback(page)).toHaveText('End your word in the bottom-right corner');
});

test('giving up: results, record, rematch, change difficulty', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await page.keyboard.press('1');
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByRole('dialog')).toContainText('Pip wins if you give up.');
  await page.getByRole('dialog').getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByText('You gave up')).toBeVisible();
  await expect(page.getByText('Pip takes this one. Rematch?')).toBeVisible();
  await expect(page.getByText('No wins vs Pip yet')).toBeVisible();

  await page.getByRole('button', { name: 'Rematch' }).click();
  await expect(page.locator('.tnum')).toHaveText('1');
  await expect(page.locator('.pl.cpu')).toContainText('Pip');

  await page.getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Give up' }).click();
  await page.getByRole('button', { name: 'Change difficulty' }).click();
  await expect(setup(page)).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Pip, Easy' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Play vs AI/ })).toContainText('Pip · Easy · you go first');
  await expect(page.getByRole('button', { name: 'Change AI opponent' })).toBeVisible();
});

test('starting a new game asks before replacing the saved one', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /Play a friend/ }).click();
  await keys(page, 'team\n');
  await page.getByRole('button', { name: 'Menu and settings' }).click();
  await page.getByRole('button', { name: 'Back to menu' }).click();
  await page.getByRole('button', { name: /Play vs AI/ }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('dialog')).toContainText(/new game/i);
});
