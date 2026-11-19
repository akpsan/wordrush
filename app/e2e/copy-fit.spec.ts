/**
 * The feedback line under the letter slots must stay on one line on a 360px phone: a second line
 * makes the controls taller and moves the board. Renders every message the line can show, with
 * worst-case values (the widest five-letter word, five letter chips, the icon its tone shows), in the real
 * app. Stepper labels get the width left between the stepper's two buttons.
 */
import { expect, test } from '@playwright/test';
import { deck } from '../src/copy/deck';
import { overrides } from '../src/copy/overrides';
import { openApp } from './helpers';

const copy: Record<string, string> = { ...deck, ...overrides };
// The game's feedback line. Not the tutorial's coach lines, the setup sheet or other screens.
const LINE = /^(type|oops|first|stepper|wait|impact)\.|^(cpu|opp)\.(danger|random|thinking|playing)/; // impact: the note row, 12px there
const RETIRED = new Set(['type.start.afterOpp']); // its opponent's-word part moved to the note row (2026-11-16)
const PARAMS: Record<string, string> = { WORD: 'WWWWW', ai: 'Juno', opponent: 'Orange', player: 'Orange', n: '5', i: '5', L: 'W' };

const messages = Object.entries(copy)
  .filter(([id]) => LINE.test(id) && !RETIRED.has(id) && !/aria|\.sr\./.test(id))
  .map(([id, s]) => [id, s.replace(/\{([^}]+)\}/g, (m, name: string) => (name === 'letters' ? '§' : (PARAMS[name] ?? m)))] as const);

test('every feedback-line message fits on one line at 360px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'phone widths');
  await page.setViewportSize({ width: 360, height: 664 });
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  expect(messages.length).toBeGreaterThan(20);
  const wrapped = await page.evaluate((list) => {
    const p = document.querySelector('p.fb') as HTMLElement;
    const chips = '<span class="chips">' + [...'STONE'].map((l) => `<span class="chip">${l}</span>`).join('') + '</span>';
    const full = p.getBoundingClientRect().width;
    p.className = 'fb good';
    p.innerHTML = '<span>x</span>';
    const one = p.getBoundingClientRect().height;
    return list.filter(([id, s]) => {
      // Errors, ready words and the danger line show an icon; the stepper's label sits between two 44px buttons.
      const icon = /^(oops\.|type\.ready|type\.danger)/.test(id) ? '<svg class="ico"></svg>' : '';
      p.style.width = id.startsWith('stepper.') ? `${full - 2 * 44 - 2 * 8}px` : '';
      const body = s.replace(/\*\*(.+?)\*\*/g, (_m, x: string) => (x === '§' ? chips : `<b>${x}</b>`)).replace(/§/g, chips);
      p.innerHTML = `${icon}<span>${body}</span>`;
      return p.getBoundingClientRect().height > one + 1;
    });
  }, messages);
  expect(wrapped).toEqual([]);
});

test('every player-card label fits on one line at 360px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'phone widths');
  await page.setViewportSize({ width: 360, height: 664 });
  await openApp(page, 'returning', { board: 'hex' });
  await page.getByRole('button', { name: /Play a friend/ }).click();
  const labels = Object.entries(copy)
    .filter(([id]) => id.startsWith('ways.') && !id.endsWith('.aria'))
    .map(([id, s]) => [id, s.replace('{n}', '3+')] as const);
  expect(labels.length).toBeGreaterThan(4);
  const wrapped = await page.evaluate((list) => {
    const span = document.querySelector('.pfoot .rlbl') as HTMLElement;
    span.innerHTML = '<svg class="ico"></svg>x'; // with the warning icon, the widest case
    const one = span.getBoundingClientRect().height;
    return list.filter(([, s]) => {
      span.innerHTML = `<svg class="ico"></svg>${s}`;
      return span.getBoundingClientRect().height > one + 1 || span.scrollWidth > span.clientWidth + 1;
    });
  }, labels);
  expect(wrapped).toEqual([]);
});
