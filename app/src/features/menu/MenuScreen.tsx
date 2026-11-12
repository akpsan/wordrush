/**
 * The main menu, which is also the mode choice: Play vs AI or Play a friend.
 * First launch: Learn to play leads. Returning: Continue first, then the mode used last.
 */

import { useMemo, useState } from 'react';
import { aiLevelName, aiName, plain, playerName, t } from '../../copy';
import { geometryOf, type Geometry, type Lexicon } from '../../engine';
import { hexLayout, type SavedSession } from '../game';
import { DEFAULT_SETUP, SetupSheet, type AiRecords, type AiSetup } from '../setup';
import { useIsDesktop } from '../../platform/media';
import { Frame } from '../../ui/Frame';
import { Icon } from '../../ui/Icon';
import { RichText } from '../../ui/RichText';
import { Sheet } from '../../ui/Sheet';
import { SettingsSheet, useResolvedTheme, useSettings } from '../settings';
import { heroBoard, type HeroCell } from './heroBoard';
import './menu.css';

export type PlayMode = 'ai' | 'friend';

export interface MenuScreenProps {
  readonly lex: Lexicon;
  /** No game played and the tutorial not seen yet. */
  readonly firstLaunch: boolean;
  /** The game in progress, if any. */
  readonly saved: SavedSession | null;
  /** The last Play vs AI setup, or null if never played vs AI. */
  readonly aiSetup: AiSetup | null;
  /** The mode played last: its button goes first. */
  readonly lastMode: PlayMode | null;
  readonly records: AiRecords;
  /** Open with the setup sheet showing ("Change difficulty" on the results). */
  readonly showSetup?: boolean;
  readonly onContinue: () => void;
  readonly onPlayAi: (setup: AiSetup) => void;
  readonly onPlayFriend: () => void;
  readonly onLearn: () => void;
}

/** A new game the player asked for, waiting on "start a new game?" when one is saved. */
type Pending = { readonly mode: 'friend' } | { readonly mode: 'ai'; readonly setup: AiSetup };

function HeroBoard({ cells, geo }: { cells: readonly HeroCell[]; geo: Geometry }) {
  const hex = geo.shape === 'hex' ? hexLayout(geo) : null;
  const shown = cells.map((c, i) => [c, i] as const).filter(([, i]) => geo.valid[i]);
  return (
    <div className={hex ? 'board mboard hex' : 'board mboard'} style={hex?.style} aria-hidden="true">
      {hex && shown.map(([, i]) => <i key={`s${i}`} className="hexslot" style={hex.slot(i)} />)}
      {shown.map(([c, i]) => {
        const anim = c.delay ? { animationDelay: `${c.delay}ms` } : undefined;
        return (
          <div key={i} className={c.className} style={hex ? { ...hex.tile(i), ...anim } : anim}>
            <span className="l">{c.letter}</span>
          </div>
        );
      })}
    </div>
  );
}

function ContinueSummary({ saved }: { saved: SavedSession }) {
  const { game, match } = saved;
  if (match.mode === 'ai') {
    const ai = aiName(match.level);
    const aiSide = match.human === 0 ? 'b' : 'a';
    const turn = game.toMove === match.human ? t('menu.continue.cpu.turn.you') : t('menu.continue.cpu.turn.ai', { ai });
    return (
      <span className="mcont">
        <span className={`pip ${aiSide} bot ${match.level}`} aria-hidden="true" />
        {plain('menu.continue.sub.cpu', { ai, level: aiLevelName(match.level), n: game.turn, yourMoveOrTheirs: turn })}
      </span>
    );
  }
  return (
    <span className="mcont">
      <span className={game.toMove === 0 ? 'mini a' : 'mini b'} aria-hidden="true" />
      {plain('menu.continue.sub.friend', { n: game.turn, player: playerName(game.toMove) })}
    </span>
  );
}

function aiSubtitle(setup: AiSetup | null): string {
  if (!setup) return t('menu.cpu.sub.first');
  const ai = aiName(setup.level);
  return t('menu.cpu.sub.last', { ai, level: aiLevelName(setup.level), whoFirst: t(`menu.cpu.whoFirst.${setup.first}`, { ai }) });
}

export function MenuScreen(props: MenuScreenProps) {
  const { lex, firstLaunch, saved, aiSetup, lastMode, records, onContinue, onLearn } = props;
  const theme = useResolvedTheme();
  const desk = useIsDesktop();
  const { settings } = useSettings();
  const hero = useMemo(() => heroBoard(lex, settings.board), [lex, settings.board]);
  const [sheet, setSheet] = useState<'settings' | 'setup' | 'abandon' | null>(props.showSetup ? 'setup' : null);
  const [pending, setPending] = useState<Pending | null>(null);

  const go = (p: Pending) => (p.mode === 'ai' ? props.onPlayAi(p.setup) : props.onPlayFriend());
  /** Start a new game, asking first if it would replace the saved one. */
  const begin = (p: Pending) => {
    if (!saved) return go(p);
    setPending(p);
    setSheet('abandon');
  };
  // Returning player: one tap with the last setup. First time: the setup sheet.
  const playAi = () => (aiSetup ? begin({ mode: 'ai', setup: aiSetup }) : setSheet('setup'));

  const learn = firstLaunch ? (
    <button type="button" className="mbtn pri" onClick={onLearn}>
      <Icon name="book" />
      <span className="mt">
        <b>{t('menu.learn.title')}</b>
        <span>{t('menu.learn.sub')}</span>
      </span>
      <span className="mpill">{t('menu.learn.pill.first')}</span>
    </button>
  ) : (
    <button type="button" className="mbtn small" onClick={onLearn}>
      <Icon name="book" />
      <span className="mt">
        <b>{t('menu.learn.title')}</b>
      </span>
      <span className="mpill">{t('menu.learn.pill.returning')}</span>
    </button>
  );

  // The mode used last is the primary button (Play vs AI if neither, or on first launch the tutorial is).
  const primary: PlayMode | null = firstLaunch ? null : (lastMode ?? 'ai');
  const aiButton = (
    <div className="mbtnrow" key="ai">
      <button type="button" className={primary === 'ai' ? 'mbtn pri' : 'mbtn'} onClick={playAi}>
        <Icon name="bot" />
        <span className="mt">
          <b>{t('menu.cpu.title')}</b>
          <span>{aiSubtitle(aiSetup)}</span>
        </span>
      </button>
      {aiSetup && (
        <button type="button" className="mbtn sq" aria-label={plain('menu.cpu.change.aria')} onClick={() => setSheet('setup')}>
          <Icon name="sliders" />
          {t('menu.cpu.change')}
        </button>
      )}
    </div>
  );
  const friendButton = (
    <button type="button" key="friend" className={primary === 'friend' ? 'mbtn pri' : 'mbtn'} onClick={() => begin({ mode: 'friend' })}>
      <Icon name="friends" />
      <span className="mt">
        <b>{t('menu.friend.title')}</b>
        <span>{t('menu.friend.sub')}</span>
      </span>
    </button>
  );
  const modes = primary === 'friend' ? [friendButton, aiButton] : [aiButton, friendButton];

  return (
    <Frame theme={theme} layout={desk ? 'desk' : 'phone'} accent={0} className="menu">
      <div className="mtop">
        <button type="button" className="ibtn" aria-label={plain('menu.settings.aria')} onClick={() => setSheet('settings')}>
          <Icon name="gear" />
        </button>
      </div>

      <div className="menuleft">
        <div className="mhero">
          <h1 className="mlogo">
            <span className="lg" aria-hidden="true">
              <i />
              <i />
            </span>
            <span>{t('menu.logo')}</span>
          </h1>
          <p className="mtag">
            <RichText text={t('menu.tagline')} />
          </p>
        </div>

        {!desk && (
          <div className="mboardwrap">
            <HeroBoard cells={hero.cells} geo={geometryOf(hero.game.rules)} />
          </div>
        )}

        <div className="mbtns">
          {saved && (
            <button type="button" className="mbtn alt" onClick={onContinue}>
              <Icon name="play" />
              <span className="mt">
                <b>{t('menu.continue.title')}</b>
                <ContinueSummary saved={saved} />
              </span>
            </button>
          )}
          {firstLaunch ? (
            <>
              {learn}
              {modes}
            </>
          ) : (
            <>
              {modes}
              {learn}
            </>
          )}
        </div>
      </div>

      {desk && (
        <div className="menuright">
          <HeroBoard cells={hero.cells} geo={geometryOf(hero.game.rules)} />
        </div>
      )}

      {sheet === 'settings' && (
        <SettingsSheet title={t('settings.title')} rows={['theme', 'board', 'hints', 'highlight', 'showAll']} onClose={() => setSheet(null)} />
      )}
      {sheet === 'setup' && (
        <SetupSheet
          initial={aiSetup ?? DEFAULT_SETUP}
          records={records}
          onClose={() => setSheet(null)}
          onStart={(setup) => {
            setSheet(null);
            begin({ mode: 'ai', setup });
          }}
        />
      )}
      {sheet === 'abandon' && pending && (
        <Sheet title={t('menu.abandon.title')} onClose={() => setSheet(null)}>
          <p className="stext">{t('menu.abandon.body')}</p>
          <div className="orow">
            <button type="button" className="btn sec" onClick={() => setSheet(null)}>
              {t('menu.abandon.keep')}
            </button>
            <button type="button" className="btn pri" onClick={() => go(pending)}>
              {t('menu.abandon.confirm')}
            </button>
          </div>
        </Sheet>
      )}
    </Frame>
  );
}
