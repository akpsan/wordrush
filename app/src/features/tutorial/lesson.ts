/**
 * The tutorial's state and what each step shows. Pure: reuses the game's engine positions,
 * entry and board models, and adds the lesson layer (scripted words, spotlight, coach lines).
 */

import { t, type CopyId } from '../../copy';
import { moveContext, playScripted, toIndex, waysOut, type CellIndex, type GameState, type Lexicon } from '../../engine';
import {
  boardView,
  createSession,
  entryView,
  type CellView,
  type EntryView,
  type Feedback,
  type Session,
} from '../game';
import { BOX_IN, BOX_IN_WORD, CHAIN, STEPS, type Step } from './script';

export interface Lesson {
  /** 0-based index into STEPS. */
  readonly step: number;
  readonly typed: string;
  readonly preferred: Session['preferred'];
  /** Step 8: POPE has been played and JAIL is boxed in. */
  readonly won: boolean;
}

export type LessonAction =
  | { readonly type: 'letter'; readonly letter: string }
  | { readonly type: 'delete' }
  | { readonly type: 'flip' }
  | { readonly type: 'play' }
  | { readonly type: 'next' };

export const startLesson = (): Lesson => ({ step: 0, typed: '', preferred: null, won: false });

/** The board each step starts from, built through the real rules. */
export interface Positions {
  /** After the first n moves of the tutorial game. */
  readonly chain: readonly GameState[];
  readonly boxIn: GameState;
}

export function buildPositions(lex: Lexicon): Positions {
  const chain = CHAIN.reduce<GameState[]>(
    (acc, move) => [...acc, playScripted(lex, [move], acc[acc.length - 1])],
    [playScripted(lex, [])],
  );
  return { chain, boxIn: playScripted(lex, BOX_IN) };
}

/** The game position a step shows, and the word just played (for the pop animation). */
function positionFor(step: number, lesson: Lesson, p: Positions, lex: Lexicon): { game: GameState; popped: number | null } {
  const last = (g: GameState) => g.words.length - 1;
  switch (step) {
    case 0: // intro: the chain the tutorial will build
      return { game: p.chain[5]!, popped: null };
    case 1:
      return { game: p.chain[0]!, popped: null };
    case 2:
      return { game: p.chain[2]!, popped: last(p.chain[2]!) };
    case 3:
      return { game: p.chain[2]!, popped: null };
    case 4:
      return { game: p.chain[4]!, popped: last(p.chain[4]!) };
    case 5:
      return { game: p.chain[4]!, popped: null };
    case 6: // the opponent doesn't reply between steps 6 and 7
      return { game: { ...p.chain[5]!, toMove: 0 }, popped: null };
    case 7: {
      if (!lesson.won) return { game: p.boxIn, popped: null };
      const won = playScripted(lex, [BOX_IN_WORD], p.boxIn);
      return { game: won, popped: last(won) };
    }
    default: {
      const done = playScripted(lex, [BOX_IN_WORD], p.boxIn);
      return { game: done, popped: null };
    }
  }
}

export interface LessonView {
  readonly step: Step;
  readonly index: number;
  readonly game: GameState;
  readonly cells: readonly CellView[];
  readonly entry: EntryView;
  readonly feedback: Feedback;
  readonly coachTag: string;
  readonly coachLine: string;
  /** Typing is allowed (the keyboard is live). */
  readonly typing: boolean;
  readonly canPlay: boolean;
  /** The word is complete but on another spot: Flip is the next thing to do. */
  readonly needsFlip: boolean;
  /** The bumped attempt in step 7. */
  readonly bumped: boolean;
  /** The continue button's label, when the step continues with a button. */
  readonly continueLabel: CopyId | null;
  readonly keyEmphasis: (key: string) => 'next' | 'dim' | undefined;
  /** Step 8's danger meters, before and after the winning word. */
  readonly meters: { readonly them: string; readonly themSegments: number } | null;
  readonly note: CopyId | null;
}

const lessonSession = (game: GameState, lesson: Lesson, popped: number | null): Session => ({
  ...createSession(game),
  typed: lesson.typed,
  preferred: lesson.preferred,
  lastPlay: popped === null ? null : { wordIndex: popped, gain: 0 },
});

export function lessonView(lesson: Lesson, positions: Positions, lex: Lexicon): LessonView {
  const step = STEPS[lesson.step]!;
  const { game, popped } = positionFor(lesson.step, lesson, positions, lex);
  const session = lessonSession(game, lesson, popped);
  const base = entryView(session, lex);
  const word = 'word' in step ? step.word : '';
  const typed = lesson.typed;
  const onScript = word.startsWith(typed);
  const complete = typed.length > 0 && typed === word;

  const spot = step.kind === 'type' ? step.spot : null;
  const current = base.current;
  const onTarget =
    !!spot && complete && !!current && current.row === spot.row && current.col === spot.col && current.dir === spot.dir;
  const typingStep = (step.kind === 'type' && !lesson.won) || step.kind === 'bump';
  const bumped = step.kind === 'bump' && complete;
  const canPlay = step.kind === 'type' && !lesson.won && onTarget && base.ready;
  const needsFlip = step.kind === 'type' && !lesson.won && complete && !onTarget && base.spots.length > 1;

  // The preview looks "ready" (dashed, in colour) only for the scripted word.
  const entry: EntryView = { ...base, ready: complete && onScript && base.ready };
  const showAnchors = typingStep;
  let cells = boardView(session, entry, lex, { showWaysOut: false, showAnchors });
  if (step.kind === 'intro') cells = looping(cells, game);
  else if (step.kind !== 'done') cells = spotlighted(cells, spotlight(lesson.step, game, entry, popped, typingStep));
  if (step.kind === 'bump') cells = withAttempt(cells, game, step.attempt, typed);

  const typingKeys = typingStep && !bumped;
  return {
    step,
    index: lesson.step,
    game,
    cells,
    entry,
    feedback: feedbackFor(step, lesson, { typed, onScript, complete, onTarget, bumped, real: lex.has(typed) }),
    coachTag: t(step.kind === 'type' && lesson.won ? 'learn.8.won.tag' : step.tag),
    coachLine: t(
      step.kind === 'type' && lesson.won ? 'learn.8.won.coach' : bumped && step.kind === 'bump' ? step.bumpCoach : step.coach,
    ),
    typing: typingKeys,
    canPlay,
    needsFlip,
    bumped,
    continueLabel:
      step.kind === 'watch'
        ? 'learn.yourturn'
        : bumped
          ? 'learn.7.button'
          : step.kind === 'type' && lesson.won
            ? 'learn.8.button'
            : null,
    keyEmphasis: (key) => {
      if (!typingKeys) return undefined;
      if (!onScript) return key === 'delete' ? 'next' : 'dim';
      if (complete) return 'dim';
      return key === word[typed.length] ? 'next' : 'dim';
    },
    meters: step.kind === 'type' && step.board === 'boxIn' ? opponentMeter(game, lex) : null,
    note: step.kind === 'type' && !lesson.won ? (step.note ?? null) : null,
  };
}

/** Orange's room in the last lesson, measured like the game's own meter. */
function opponentMeter(game: GameState, lex: Lexicon): { them: string; themSegments: number } {
  const ways = waysOut(moveContext(game, 1), lex);
  return ways === 0
    ? { them: t('learn.8.won.meter'), themSegments: 0 }
    : { them: t('learn.8.meter.them', { n: ways }), themSegments: Math.min(ways, 4) };
}

interface Progress {
  readonly typed: string;
  readonly onScript: boolean;
  readonly complete: boolean;
  readonly onTarget: boolean;
  readonly bumped: boolean;
  readonly real: boolean;
}

function feedbackFor(step: Step, lesson: Lesson, p: Progress): Feedback {
  const neutral = (text: string): Feedback => ({ tone: 'neutral', text, pip: null });
  if (step.kind === 'type' && lesson.won) return { tone: 'good', text: t('learn.8.won.line'), pip: null };
  if (step.kind !== 'type' && step.kind !== 'bump') return neutral('');
  const WORD = step.word.toUpperCase();
  if (step.kind === 'bump' && p.bumped) return { tone: 'err', text: t(step.bumpLine), pip: null };
  if (!p.typed) return neutral(t(step.empty));
  if (!p.onScript) return { tone: 'steer', text: t(p.real ? 'learn.steer.real' : 'learn.steer', { WORD }), pip: null };
  if (!p.complete) return neutral(t('learn.keepgoing', { WORD }));
  if (step.kind === 'type' && !p.onTarget) return { tone: 'good', text: t(step.flip), pip: null };
  return step.kind === 'type' ? { tone: 'good', text: t(step.ready), pip: null } : neutral('');
}

/** Cells that stay bright; everything else dims to keep attention on the lesson. */
function spotlight(
  step: number,
  game: GameState,
  entry: EntryView,
  popped: number | null,
  typing: boolean,
): Set<CellIndex> {
  const n = game.rules.size;
  const lit = new Set<CellIndex>();
  const addWord = (i: number | null | undefined) => {
    if (i !== null && i !== undefined) game.words[i]?.cells.forEach((c) => lit.add(c));
  };
  if (entry.current) {
    const c = entry.current;
    for (let k = 0; k < c.word.length; k++) lit.add(c.dir === 'across' ? toIndex(n, c.row, c.col + k) : toIndex(n, c.row + k, c.col));
  }
  if (typing && !game.result) addWord(game.lastWord[game.toMove]);
  if (typing && game.lastWord[0] === null) lit.add(0);
  addWord(popped);
  if (step === 7) {
    addWord(game.lastWord[1]); // JAIL
    if (game.result) game.board.forEach((_, i) => lit.add(i)); // after the win, show everything that closed it
  }
  return lit;
}

const spotlighted = (cells: readonly CellView[], lit: Set<CellIndex>): CellView[] =>
  cells.map((c) => (lit.has(c.index) ? c : { ...c, className: `${c.className} dim` }));

/** The intro board: the chain letters pop in, in order, on a loop. */
function looping(cells: readonly CellView[], game: GameState): CellView[] {
  const order = new Map<CellIndex, number>();
  game.words.forEach((w) => w.cells.forEach((c) => order.has(c) || order.set(c, order.size)));
  return cells.map((c) => {
    const at = order.get(c.index);
    return at === undefined ? c : { ...c, className: c.className.replace(/ recent| flash| f[ab]| pop/g, '') + ' loop', delay: at * 260 };
  });
}

/** Step 7: draw the attempted word where it tries to go, bumping into the letter in its way. */
function withAttempt(cells: readonly CellView[], game: GameState, attempt: { row: number; col: number; dir: string }, typed: string): CellView[] {
  const n = game.rules.size;
  const out = cells.slice();
  for (let k = 0; k < typed.length; k++) {
    const cell = attempt.dir === 'across' ? toIndex(n, attempt.row, attempt.col + k) : toIndex(n, attempt.row + k, attempt.col);
    const existing = game.board[cell];
    const base = { ...out[cell]!, className: out[cell]!.className.replace(' dim', '') };
    const isLink = k === typed.length - 1 && existing?.letter === typed[k];
    if (isLink) out[cell] = { ...base, className: `${base.className} gring weak` };
    else if (existing) out[cell] = { ...base, className: `${base.className} bump` };
    else out[cell] = { ...base, letter: typed[k]!, className: `${base.className} gpart`, delay: k * 30 };
  }
  return out;
}

export function lessonReducer(positions: Positions, lex: Lexicon) {
  return function reduce(lesson: Lesson, action: LessonAction): Lesson {
    const view = lessonView(lesson, positions, lex);
    const advance = (): Lesson => ({ step: Math.min(lesson.step + 1, STEPS.length - 1), typed: '', preferred: null, won: false });
    switch (action.type) {
      case 'letter':
        if (!view.typing || lesson.typed.length >= view.entry.maxLen) return lesson;
        return { ...lesson, typed: lesson.typed + action.letter };
      case 'delete':
        return view.typing ? { ...lesson, typed: lesson.typed.slice(0, -1) } : lesson;
      case 'flip': {
        const { spots, index } = view.entry;
        if (spots.length < 2) return lesson;
        const next = spots[(index + 1) % spots.length]!;
        return { ...lesson, preferred: { anchor: next.anchor, anchorAt: next.anchorAt, dir: next.dir } };
      }
      case 'play':
        if (!view.canPlay) return lesson;
        return view.step.kind === 'type' && view.step.board === 'boxIn' ? { ...lesson, won: true } : advance();
      case 'next':
        return view.continueLabel || view.step.kind === 'intro' ? advance() : lesson;
    }
  };
}

export const STEP_COUNT = STEPS.length;
