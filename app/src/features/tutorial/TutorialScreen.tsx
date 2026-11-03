/** Learn to play: the real board and keyboard, driven by the lesson script. */

import { useMemo, useReducer, useState } from 'react';
import { plain, t } from '../../copy';
import type { Lexicon } from '../../engine';
import { useIsDesktop } from '../../platform/media';
import { useKeyboardCommands, type KeyCommand } from '../../platform/keyboard';
import { Frame } from '../../ui/Frame';
import { Icon } from '../../ui/Icon';
import { RichText } from '../../ui/RichText';
import { Sheet } from '../../ui/Sheet';
import { Board, Entry, Keyboard } from '../game';
import { useResolvedTheme } from '../settings';
import { buildPositions, lessonReducer, lessonView, startLesson, STEP_COUNT, type LessonAction, type LessonView } from './lesson';
import './tutorial.css';

export interface TutorialScreenProps {
  readonly lex: Lexicon;
  /** Finished, or skipped: the app marks the tutorial as seen. */
  readonly onExit: (to: 'menu' | 'play') => void;
}

function Progress({ index }: { index: number }) {
  return (
    <div
      className="tdots"
      role="progressbar"
      aria-label={plain('learn.progress.aria', { n: index + 1 })}
      aria-valuemin={1}
      aria-valuemax={STEP_COUNT}
      aria-valuenow={index + 1}
    >
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <i key={i} className={i < index ? 'done' : i === index ? 'on' : ''} />
      ))}
    </div>
  );
}

function Meters({ them, themSegments }: { them: string; themSegments: number }) {
  return (
    <div className="mmeters">
      <div className="mm a">
        <span className="mmh">
          <span className="mini a" aria-hidden="true" />
          {t('player.you')}
        </span>
        <span className="segs">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="on" />
          ))}
        </span>
        <span className="rlbl">{t('learn.8.meter.you')}</span>
      </div>
      <div className={themSegments === 0 ? 'mm b zero' : 'mm b'} role="meter" aria-label={plain('player.orange')} aria-valuetext={them} aria-valuenow={themSegments} aria-valuemin={0} aria-valuemax={4}>
        <span className="mmh">
          <span className="mini b" aria-hidden="true" />
          {t('player.orange')}
        </span>
        <span className="segs">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < themSegments ? 'on' : ''} />
          ))}
        </span>
        <span className="rlbl">{them}</span>
      </div>
    </div>
  );
}

const RECAP = [
  ['link', 'learn.9.recap.1'],
  ['bars', 'learn.9.recap.2'],
  ['grid', 'learn.9.recap.3'],
  ['lock', 'learn.9.recap.4'],
] as const;

function Controls({ view, dispatch }: { view: LessonView; dispatch: (a: LessonAction) => void }) {
  const { entry } = view;
  const n = entry.spots.length;
  const watching = view.step.kind === 'watch';
  const move = view.step.kind === 'watch' ? view.step.move : null;
  return (
    <>
      {watching ? (
        <div className="entrywrap">
          <div className="typing">
            <span className="mini b" aria-hidden="true" />
            <span>{t('learn.oppPlays', { WORD: move!.word.toUpperCase() })}</span>
          </div>
          <p className="fb" role="status" />
        </div>
      ) : (
        <Entry
          entry={entry}
          feedback={view.feedback}
          problemId={view.bumped ? 1 : null}
          firstWordNote={view.note !== null}
        />
      )}
      <Keyboard
        enabled={view.typing}
        highlight={new Set()}
        emphasis={view.keyEmphasis}
        onLetter={(letter) => dispatch({ type: 'letter', letter })}
        onDelete={() => dispatch({ type: 'delete' })}
      />
      <div className="actions">
        {view.continueLabel ? (
          <button type="button" className="btn pri next" onClick={() => dispatch({ type: 'next' })}>
            {t(view.continueLabel)}
          </button>
        ) : view.step.kind === 'type' ? (
          <>
            <button
              type="button"
              className={view.needsFlip ? 'btn sec next' : 'btn sec'}
              onClick={() => dispatch({ type: 'flip' })}
              disabled={n < 2}
              aria-label={plain('btn.flip.aria', { i: entry.index + 1, n })}
            >
              <Icon name="flip" />
              <span>{t('learn.flip')}</span>
              <span className="cnt">{n ? t('btn.flip.count', { i: entry.index + 1, n }) : '–'}</span>
            </button>
            <button
              type="button"
              className={view.canPlay ? 'btn pri next' : 'btn pri soft'}
              onClick={() => dispatch({ type: 'play' })}
              aria-disabled={!view.canPlay}
            >
              {view.canPlay ? t('btn.play.ready', { WORD: entry.typed.toUpperCase() }) : t('learn.play')}
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}

export function TutorialScreen({ lex, onExit }: TutorialScreenProps) {
  const theme = useResolvedTheme();
  const desk = useIsDesktop();
  const positions = useMemo(() => buildPositions(lex), [lex]);
  const reducer = useMemo(() => lessonReducer(positions, lex), [positions, lex]);
  const [lesson, dispatch] = useReducer(reducer, undefined, startLesson);
  const [skipping, setSkipping] = useState(false);
  const view = useMemo(() => lessonView(lesson, positions, lex), [lesson, positions, lex]);
  const { step } = view;
  const last = view.index === STEP_COUNT - 1;

  useKeyboardCommands((c: KeyCommand) => {
    if (c.kind === 'letter') dispatch({ type: 'letter', letter: c.letter });
    else if (c.kind === 'delete') dispatch({ type: 'delete' });
    else if (c.kind === 'flip') dispatch({ type: 'flip' });
    else if (c.kind === 'play') dispatch(view.continueLabel || step.kind === 'intro' ? { type: 'next' } : { type: 'play' });
  }, !skipping && step.kind !== 'done');

  return (
    <Frame theme={theme} layout={desk ? 'desk' : 'phone'} accent={0}>
      <header className="thdr hdr">
        <button type="button" className="skipbtn" onClick={() => setSkipping(true)} disabled={last}>
          {t('learn.skip')}
        </button>
        <Progress index={view.index} />
        <span className="tcount" aria-hidden="true">
          {t('learn.progress', { n: view.index + 1 })}
        </span>
      </header>

      <section className="side">
        <div className="coachbar" role="status">
          <span className="ctag">{view.coachTag}</span>
          <p className="cline">
            <RichText text={view.coachLine} />
          </p>
          {view.meters && <Meters {...view.meters} />}
        </div>
      </section>

      <Board cells={view.cells} onFlip={() => dispatch({ type: 'flip' })} onFilter={() => undefined} />

      <section className="bottom">
        {step.kind === 'intro' && (
          <div className="intro">
            <p className="bigline">{t('learn.1.big')}</p>
            <p className="sub">{t('learn.1.body')}</p>
            <button type="button" className="btn pri next" onClick={() => dispatch({ type: 'next' })}>
              {t('learn.1.button')}
            </button>
          </div>
        )}
        {step.kind === 'done' && (
          <div className="donep panel">
            <span className="otitle a">{t('learn.9.title')}</span>
            <div className="recap" aria-label={plain('learn.recap.aria')}>
              {RECAP.map(([icon, id]) => (
                <div key={id}>
                  <Icon name={icon} />
                  {t(id)}
                </div>
              ))}
            </div>
            <div className="orow">
              <button type="button" className="btn sec" onClick={() => onExit('menu')}>
                {t('learn.9.menu')}
              </button>
              <button type="button" className="btn pri" onClick={() => onExit('play')}>
                {t('learn.9.play')}
              </button>
            </div>
          </div>
        )}
        {step.kind !== 'intro' && step.kind !== 'done' && <Controls view={view} dispatch={dispatch} />}
      </section>

      {skipping && (
        <Sheet title={t('learn.skip.title')} onClose={() => setSkipping(false)}>
          <p className="stext">
            <RichText text={t('learn.skip.body')} />
          </p>
          <div className="orow">
            <button type="button" className="btn sec" onClick={() => setSkipping(false)}>
              {t('learn.skip.keep')}
            </button>
            <button type="button" className="btn pri" onClick={() => onExit('menu')}>
              {t('learn.skip.confirm')}
            </button>
          </div>
        </Sheet>
      )}
    </Frame>
  );
}
