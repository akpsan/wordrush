import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../../dictionary';
import { entryView } from './entry';
import { feedbackFor } from './feedback';
import { createSession, sessionReducer, type Session, type SessionAction } from './session';
import { playerStatus } from './status';

const lex = getLexicon();
const reduce = sessionReducer(lex);
const run = (actions: SessionAction[], s: Session = createSession()) => actions.reduce(reduce, s);
const type = (word: string): SessionAction[] => [...word].map((letter) => ({ type: 'letter', letter }));
const playWord = (word: string, flips = 0): SessionAction[] => [
  ...type(word),
  ...Array.from({ length: flips }, () => ({ type: 'flip' }) as const),
  { type: 'play' },
];

describe('typing and previews', () => {
  it('caps Blue\'s first word at 4 letters', () => {
    const s = run(type('teams'));
    expect(s.typed).toBe('team');
  });

  it('flips between spots and wraps around', () => {
    let s = run(type('team'));
    expect(entryView(s, lex).current?.dir).toBe('across');
    s = run([{ type: 'flip' }], s);
    expect(entryView(s, lex).current?.dir).toBe('down');
    s = run([{ type: 'flip' }], s);
    expect(entryView(s, lex).current?.dir).toBe('across');
  });

  it('keeps the flipped spot while the word is edited', () => {
    const s = run([...type('tea'), { type: 'flip' }, { type: 'letter', letter: 'm' }]);
    expect(entryView(s, lex).current).toMatchObject({ word: 'team', dir: 'down' });
    const back = run([{ type: 'delete' }], s);
    expect(entryView(back, lex).current).toMatchObject({ word: 'tea', dir: 'down' });
  });

  it('falls back to the first spot when the chosen one no longer fits', () => {
    const s: Session = { ...run(type('tea')), preferred: { anchor: 63, anchorAt: 'end', dir: 'down' } };
    expect(entryView(s, lex)).toMatchObject({ index: 0, current: { dir: 'across' } });
  });

  it('escape clears the letter filter first, then the word', () => {
    let s = run([...playWord('team'), ...playWord('stone'), ...type('ma')]);
    s = run([{ type: 'filter', cell: 3 }], s);
    expect(s.filter).toBe(3);
    s = run([{ type: 'escape' }], s);
    expect([s.filter, s.typed]).toEqual([null, 'ma']);
    s = run([{ type: 'escape' }], s);
    expect(s.typed).toBe('');
  });
});

describe('playing', () => {
  it('plays the previewed spot and hands the turn over', () => {
    const s = run(playWord('team', 1)); // flipped down
    expect(s.game.words[0]).toMatchObject({ word: 'team', dir: 'down', player: 0 });
    expect(s.game.toMove).toBe(1);
    expect(s.lastPlay).toEqual({ wordIndex: 0, gain: 4 });
    expect(s.typed).toBe('');
  });

  it('counts only new squares as the gain', () => {
    const s = run([...playWord('team'), ...playWord('stone'), ...playWord('map', 1)]);
    expect(s.lastPlay?.gain).toBe(2);
  });

  it('explains a failed play and replays the shake on each attempt', () => {
    let s = run([...playWord('team'), ...playWord('stone'), ...playWord('rqx')]);
    expect(s.problem).toEqual({ kind: 'not-a-word', id: 1 });
    expect(feedbackFor(s, entryView(s, lex), lex).text).toBe("Hmm, **RQX** isn't a word we know. Try another?");
    s = run([{ type: 'play' }], s);
    expect(s.problem?.id).toBe(2);
    s = run([{ type: 'delete' }], s);
    expect(s.problem).toBeNull();
  });

  it('tells the next player what was just played', () => {
    const s = run([...playWord('team'), ...playWord('stone')]);
    expect(feedbackFor(s, entryView(s, lex), lex)).toEqual({
      tone: 'neutral',
      text: 'Orange played STONE. Start or end with **T, E, A or M**',
      pip: 1,
    });
  });
});

describe('ending', () => {
  it('giving up goes straight to the results', () => {
    const s = run([{ type: 'giveUp' }]);
    expect(s.game.result).toEqual({ winner: 1, reason: 'gave-up' });
    expect(s.resultsShown).toBe(true);
  });

  it('boxing someone in shows the boxed-in moment, then the results', () => {
    // The tutorial's last lesson: PLANT boxes in DOGS.
    let s = run([...playWord('team'), ...playWord('star', 1), ...playWord('maple'), ...playWord('dogs', 1)]);
    expect(playerStatus(s, lex, 1).ways).toBeGreaterThan(0);
    s = run(playWord('plant'), s);
    expect(s.game.result).toMatchObject({ winner: 0, reason: 'boxed-in' });
    expect(s.resultsShown).toBe(false);
    expect(playerStatus(s, lex, 1)).toMatchObject({ ways: 0, label: 'Boxed in' });
    expect(run([{ type: 'showResults' }], s).resultsShown).toBe(true);
  });

  it('ignores typing once the game is over', () => {
    const s = run([{ type: 'giveUp' }, ...type('cat')]);
    expect(s.typed).toBe('');
  });
});
