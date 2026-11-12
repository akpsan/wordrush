import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { heroBoard } from './heroBoard';

it('builds the menu board from legal moves, letters popping in play order', () => {
  const { cells } = heroBoard(getLexicon());
  expect(cells.filter((c) => c.letter)).toHaveLength(19) // 8 words; every word after the first two shares its link letter;
  expect(cells[0]).toMatchObject({ letter: 't', delay: 0 });
  expect(cells.filter((c) => c.className.includes('recent')).map((c) => c.letter).join('')).toBe('tingas');
});

describe('hex hero board', () => {
  it('replays a legal hex position with both players on it', () => {
    const { cells, game } = heroBoard(getLexicon(), 'hex');
    expect(game.rules.shape).toBe('hex');
    expect(game.result).toBeNull();
    expect(cells.some((c) => c.className.includes(' a'))).toBe(true);
    expect(cells.some((c) => c.className.includes(' b'))).toBe(true);
  });
});
