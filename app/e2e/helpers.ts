import type { Page } from '@playwright/test';

export type Player = 'new' | 'returning';

/** Open the app as a first-time or returning player, with optional settings. */
export async function openApp(page: Page, player: Player = 'returning', settings: Record<string, unknown> = {}) {
  await page.goto('/');
  await page.evaluate(
    ({ player, settings }) => {
      localStorage.clear();
      if (player === 'returning') {
        localStorage.setItem('wordrush:v1:progress', JSON.stringify({ tutorialSeen: true, hasPlayed: true }));
      }
      localStorage.setItem(
        'wordrush:v1:settings',
        JSON.stringify({ theme: 'dark', hints: 0, highlightLetters: true, showWaysOut: true, ...settings }),
      );
    },
    { player, settings },
  );
  await page.reload();
}

/**
 * Type on the physical keyboard. Letters type; ' ' flips; '\n' plays.
 * Tests use the physical keyboard on both sizes: the on-screen keys are covered separately.
 */
export async function keys(page: Page, text: string) {
  for (const ch of text) {
    await page.keyboard.press(ch === '\n' ? 'Enter' : ch === ' ' ? 'Space' : ch);
  }
}

/**
 * The tutorial's last lesson as a real game: Blue boxes Orange in with PLANT.
 * A space after a word flips it to the scripted spot before playing.
 */
export const BOX_IN_GAME = 'team\nstar \nmaple\ndogs \nplant\n';

/** The tutorial's chain as a real game (TEAM, DOG, MAP, BIG, TOP): TEAM is two Blue words old. Orange to move. */
export const FADE_GAME = 'team\ndog \nmap \nbig\ntop\n';
