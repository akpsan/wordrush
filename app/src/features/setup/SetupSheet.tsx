/**
 * The Play vs AI setup sheet: pick an opponent, who goes first, and hints, then start.
 * Keyboard: arrow keys move between opponents, 1/2/3 pick Easy/Medium/Hard, Enter starts.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LEVELS, type Level } from '../../ai';
import { aiDescription, aiLevelName, aiName, t } from '../../copy';
import type { FirstChoice } from '../game';
import { Segmented } from '../../ui/Controls';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { useSettings, type HintsPerGame } from '../settings';
import type { AiRecords, AiSetup } from './setup';
import './setup.css';

export interface SetupSheetProps {
  readonly initial: AiSetup;
  readonly records: AiRecords;
  readonly onStart: (setup: AiSetup) => void;
  readonly onClose: () => void;
}

const BARS: Record<Level, number> = { easy: 1, medium: 2, hard: 3 };


/** One radio card per opponent. Only the selected card is in the Tab order (roving focus). */
function OpponentCards({ level, onPick }: { level: Level; onPick: (l: Level) => void }) {
  const refs = useRef<Partial<Record<Level, HTMLButtonElement | null>>>({});
  const move = (e: KeyboardEvent, step: number) => {
    e.preventDefault();
    const next = LEVELS[(LEVELS.indexOf(level) + step + LEVELS.length) % LEVELS.length]!;
    onPick(next);
    refs.current[next]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(e, 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(e, -1);
  };
  return (
    <div className="lvls" role="radiogroup" aria-label={t('cpu.setup.level.label')} onKeyDown={onKeyDown}>
      {LEVELS.map((l) => (
        <button
          key={l}
          ref={(el) => {
            refs.current[l] = el;
          }}
          type="button"
          role="radio"
          aria-checked={l === level}
          aria-label={t('cpu.setup.card.aria', { ai: aiName(l), level: aiLevelName(l) })}
          tabIndex={l === level ? 0 : -1}
          className={l === level ? 'lvlcard on' : 'lvlcard'}
          onClick={() => onPick(l)}
        >
          <span className={`pip b bot ${l}`} aria-hidden="true" />
          <span className="pn">{aiName(l)}</span>
          <span className="pl2">
            <span className="bars" aria-hidden="true">
              {[1, 2, 3].map((b) => (
                <i key={b} className={b <= BARS[l] ? 'on' : ''} />
              ))}
            </span>
            {aiLevelName(l)}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SetupSheet({ initial, records, onStart, onClose }: SetupSheetProps) {
  const [level, setLevel] = useState<Level>(initial.level);
  const [first, setFirst] = useState<FirstChoice>(initial.first);
  const { settings, update } = useSettings();
  const ai = aiName(level);
  const wins = records[level].wins;

  // Desktop shortcuts: 1/2/3 pick a level; Enter starts unless focus is on another button.
  const start = useRef(() => {});
  start.current = () => onStart({ level, first });
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const i = ['1', '2', '3'].indexOf(e.key);
      if (i >= 0) setLevel(LEVELS[i]!);
      const target = e.target as HTMLElement | null;
      const onOtherButton = target?.tagName === 'BUTTON' && target.getAttribute('role') !== 'radio';
      if (e.key === 'Enter' && !onOtherButton) {
        e.preventDefault();
        start.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Sheet title={t('cpu.setup.title')} onClose={onClose}>
      <div className="sgroup">
        <span className="slabel">{t('cpu.setup.level.label')}</span>
        <OpponentCards level={level} onPick={setLevel} />
        <p className="lvldesc" aria-live="polite">
          {aiDescription(level)}
        </p>
        <p className="reclabel">
          <Icon name="trophy" />
          <span>{wins > 0 ? t('cpu.record', { ai, n: wins }) : t('cpu.record.none', { ai })}</span>
        </p>
      </div>
      <div className="sgroup">
        <span className="slabel">{t('cpu.setup.first.label')}</span>
        <Segmented<FirstChoice>
          wide
          label={t('cpu.setup.first.label')}
          value={first}
          options={[
            { value: 'you', label: t('cpu.setup.first.you') },
            { value: 'ai', label: t('cpu.setup.first.ai', { ai }) },
            { value: 'random', label: t('cpu.setup.first.random') },
          ]}
          onChange={setFirst}
        />
        <p className="shelp">{t(`cpu.setup.first.${first}.help`)}</p>
      </div>
      <div className="setrow">
        <div className="st">
          <b>{t('cpu.setup.hints.label')}</b>
          <span>{t('cpu.setup.hints.help')}</span>
        </div>
        <Segmented<HintsPerGame>
          label={t('cpu.setup.hints.label')}
          value={settings.hints}
          options={[
            { value: 0, label: t('settings.hints.off') },
            { value: 1, label: '1' },
            { value: 3, label: '3' },
          ]}
          onChange={(hints) => update({ hints })}
        />
      </div>
      <button type="button" className="btn pri" onClick={() => start.current()}>
        {t('cpu.setup.start')}
      </button>
    </Sheet>
  );
}
