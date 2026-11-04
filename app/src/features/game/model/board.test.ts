import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { giveUp, playScripted, type ScriptedMove } from '../../../engine';
import { boardView, wordAges } from './board';
import { entryView } from './entry';
import { createSession, type Session } from './session';

const lex = getLexicon();

/**
 * The tutorial chain: Blue TEAM, MAP, TOP; Orange DOG, BIG. Orange to move.
 *   T E A M . . . .
 *   . . . A . . . .
 *   . T O P . . . .
 *   ...         d (5,7)
 *               o (6,7)
 *           b i g (7,5..7)
 */
const CHAIN: readonly ScriptedMove[] = [
  { word: 'team', dir: 'across' },
  { word: 'dog', dir: 'down' },
  { word: 'map', dir: 'down' },
  { word: 'big', dir: 'across' },
  { word: 'top', dir: 'across' },
];
const chain = () => createSession(playScripted(lex, CHAIN));
const at = (row: number, col: number) => row * 8 + col;

function classesOf(s: Session, fade = true): string[][] {
  return boardView(s, entryView(s, lex), lex, { showWaysOut: false, fade }).map((c) => c.className.split(' '));
}

describe('word ages', () => {
  it('counts later words by the same player, capped at 2', () => {
    const players = [0, 1, 0, 1, 0, 0].map((player) => ({ player: player as 0 | 1 }));
    expect(wordAges(players)).toEqual([2, 1, 2, 0, 1, 0]);
  });
});

describe('fading the board', () => {
  it('fades older words and keeps each player\'s last word at full strength', () => {
    const cls = classesOf(chain());
    expect(cls[at(0, 0)]).toContain('old'); // TEAM: two Blue words since
    expect(cls[at(1, 3)]).toContain('prev'); // MAP: the word before last
    expect(cls[at(2, 1)]).not.toContain('old'); // TOP: Blue's last word
    expect(cls[at(2, 1)]).not.toContain('prev');
    expect(cls[at(5, 7)]).toContain('prev'); // DOG: Orange's word before last
    expect(cls[at(7, 5)]).not.toContain('prev'); // BIG: Orange's last word
  });

  it('gives a shared link letter the younger age', () => {
    const cls = classesOf(chain());
    expect(cls[at(0, 3)]).toContain('prev'); // M: in TEAM (old) and MAP (prev)
    expect(cls[at(2, 3)]).not.toContain('prev'); // P: in MAP and TOP (last)
    expect(cls[at(7, 7)]).not.toContain('prev'); // G: in DOG and BIG (last)
  });

  it('dims everything but both last words and the preview while typing', () => {
    const s = { ...chain(), typed: 'g' };
    const cls = classesOf(s);
    expect(cls[at(0, 0)]).toContain('fdim');
    expect(cls[at(5, 7)]).toContain('fdim');
    expect(cls[at(2, 1)]).not.toContain('fdim');
    expect(cls[at(7, 5)]).not.toContain('fdim');
  });

  it('removes the outline from plain empty squares only while fading', () => {
    expect(classesOf(chain())[at(4, 4)]).toEqual(['cell', 'bare']);
    expect(classesOf(chain(), false)[at(4, 4)]).toEqual(['cell']);
  });

  it('keeps every letter at full strength when turned off or once the game is over', () => {
    const faded = (cls: string[][]) => cls.some((c) => c.includes('old') || c.includes('prev') || c.includes('bare'));
    expect(faded(classesOf(chain(), false))).toBe(false);
    const over = createSession(giveUp(playScripted(lex, CHAIN)));
    expect(faded(classesOf(over))).toBe(false);
  });
});
