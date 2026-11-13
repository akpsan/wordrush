import { describe, expect, it } from 'vitest';
import { getLexicon } from '../../dictionary';
import { checkEntry } from '../../engine';
import { buildPositions, lessonReducer, lessonView, startLesson, type Lesson, type LessonAction } from './lesson';

const lex = getLexicon();
const positions = buildPositions(lex);
const reduce = lessonReducer(positions, lex);
const run = (actions: LessonAction[], from: Lesson = startLesson()) => actions.reduce(reduce, from);
const type = (w: string): LessonAction[] => [...w].map((letter) => ({ type: 'letter', letter }));
const view = (l: Lesson) => lessonView(l, positions, lex);

describe('Learn to play', () => {
  it('runs from the intro to the end with the scripted moves', () => {
    let l = run([{ type: 'next' }]); // intro → TEAM
    expect(view(l).step.kind).toBe('type');
    l = run([...type('team'), { type: 'play' }], l); // → watch DOG
    expect(view(l).continueLabel).toBe('learn.yourturn');
    l = run([{ type: 'next' }, ...type('map')], l);
    expect(view(l)).toMatchObject({ canPlay: false, needsFlip: true });
    l = run([{ type: 'flip' }], l);
    expect(view(l).canPlay).toBe(true);
    l = run([{ type: 'play' }, { type: 'next' }, ...type('top'), { type: 'play' }], l); // → bump
    expect(view(l).step.kind).toBe('bump');
    l = run(type('cat'), l);
    expect(view(l)).toMatchObject({ bumped: true, continueLabel: 'learn.7.button' });
    expect(view(l).feedback.text).toBe('No room: your own **E** is in the way.');
    expect(view(run([{ type: 'next' }], l)).meters?.themSegments).toBeGreaterThan(0);
    l = run([{ type: 'next' }, ...type('plant'), { type: 'play' }], l); // → boxed in
    expect(view(l)).toMatchObject({ continueLabel: 'learn.8.button', meters: { themSegments: 0 } });
    expect(view(l).game.result).toMatchObject({ winner: 0, reason: 'boxed-in' });
    l = run([{ type: 'next' }], l);
    expect(view(l).step.kind).toBe('done');
  });

  it('steers off-script typing back gently, and the delete key is spotlighted', () => {
    const l = run([{ type: 'next' }, ...type('tear')]);
    const v = view(l);
    expect(v.feedback).toMatchObject({ tone: 'steer', text: 'Nice word! For now, try **TEAM** · tap ⌫ to fix' });
    expect(v.keyEmphasis('delete')).toBe('next');
    expect(v.canPlay).toBe(false);
  });

  it('spotlights the next letter to type', () => {
    const v = view(run([{ type: 'next' }, ...type('te')]));
    expect([v.keyEmphasis('a'), v.keyEmphasis('m')]).toEqual(['next', 'dim']);
  });

  it('ignores Play until the word is on the scripted spot', () => {
    const l = run([{ type: 'next' }, { type: 'next' }, { type: 'next' }]); // can't skip a typing step
    expect(l.step).toBe(1);
  });
});

describe('Learn to play on the hexagon', () => {
  const hp = buildPositions(lex, 'hex');
  const hreduce = lessonReducer(hp, lex);
  const hrun = (actions: LessonAction[], from: Lesson = startLesson()) => actions.reduce(hreduce, from);
  const hview = (l: Lesson) => lessonView(l, hp, lex);

  it('runs from the intro to the end with the hex moves', () => {
    expect(hp.start.rules.shape).toBe('hex');
    let l = hrun([{ type: 'next' }]); // intro → TEA
    l = hrun([...type('tea'), { type: 'play' }], l); // → watch DOG
    expect(hview(l).continueLabel).toBe('learn.yourturn');
    l = hrun([{ type: 'next' }, ...type('arm')], l);
    expect(hview(l)).toMatchObject({ canPlay: false, needsFlip: true });
    while (!hview(l).canPlay) l = hrun([{ type: 'flip' }], l); // flip to the down-right spot
    l = hrun([{ type: 'play' }, { type: 'next' }, ...type('car'), { type: 'play' }], l); // → bump
    expect(hview(l).step.kind).toBe('bump');
    l = hrun(type('sea'), l);
    expect(hview(l)).toMatchObject({ bumped: true, continueLabel: 'learn.7.button' });
    expect(hview(l).feedback.text).toBe('No room: your own letters are in the way.');
    l = hrun([{ type: 'next' }, ...type('race'), { type: 'play' }], l); // → boxed in
    expect(hview(l).game.result).toMatchObject({ winner: 0, reason: 'boxed-in' });
    expect(hview(l).coachLine).toContain('THEM has no room left');
    l = hrun([{ type: 'next' }], l);
    expect(hview(l).step.kind).toBe('done');
  });

  it('SEA has no spot anywhere: the real engine produces the bump', () => {
    const before = { ...hp.chain[5]!, toMove: 0 as const };
    expect(checkEntry(before, lex, 'sea').ok).toBe(false);
  });
});
