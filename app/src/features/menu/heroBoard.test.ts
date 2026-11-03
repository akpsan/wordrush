import { expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { heroBoard } from './heroBoard';

it('builds the menu board from legal moves, letters popping in play order', () => {
  const cells = heroBoard(getLexicon());
  expect(cells.filter((c) => c.letter)).toHaveLength(19) // 8 words; every word after the first two shares its link letter;
  expect(cells[0]).toMatchObject({ letter: 't', delay: 0 });
  expect(cells.filter((c) => c.className.includes('recent')).map((c) => c.letter).join('')).toBe('tingas');
});
