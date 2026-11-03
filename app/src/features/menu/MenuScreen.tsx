/** The main menu: first launch (Learn to play first) or returning (Continue first). */

import { useMemo, useState } from 'react';
import { plain, playerName, t } from '../../copy';
import type { GameState, Lexicon } from '../../engine';
import { useIsDesktop } from '../../platform/media';
import { Frame } from '../../ui/Frame';
import { Icon } from '../../ui/Icon';
import { RichText } from '../../ui/RichText';
import { Sheet } from '../../ui/Sheet';
import { waysOutFor } from '../game';
import { SettingsSheet, useResolvedTheme } from '../settings';
import { heroBoard, type HeroCell } from './heroBoard';
import './menu.css';

export interface MenuScreenProps {
  readonly lex: Lexicon;
  /** No game played and the tutorial not seen yet. */
  readonly firstLaunch: boolean;
  /** The game in progress, if any. */
  readonly saved: GameState | null;
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
  readonly onLearn: () => void;
}

function HeroBoard({ cells }: { cells: readonly HeroCell[] }) {
  return (
    <div className="board mboard" aria-hidden="true">
      {cells.map((c, i) => (
        <div key={i} className={c.className} style={c.delay ? { animationDelay: `${c.delay}ms` } : undefined}>
          <span className="l">{c.letter}</span>
        </div>
      ))}
    </div>
  );
}

function ContinueSummary({ game, lex }: { game: GameState; lex: Lexicon }) {
  const ways = waysOutFor(game, lex, game.toMove);
  const waysLabel = ways === 1 ? t('ways.one') : ways === 0 ? t('ways.none') : t('ways.many', { n: ways });
  return (
    <span className="mcont">
      <span className={game.toMove === 0 ? 'mini a' : 'mini b'} aria-hidden="true" />
      {ways <= 1 && <Icon name="warn" />}
      {plain('menu.continue.sub', { n: game.turn, player: playerName(game.toMove), waysOut: waysLabel })}
    </span>
  );
}

export function MenuScreen({ lex, firstLaunch, saved, onContinue, onNewGame, onLearn }: MenuScreenProps) {
  const theme = useResolvedTheme();
  const desk = useIsDesktop();
  const cells = useMemo(() => heroBoard(lex), [lex]);
  const [sheet, setSheet] = useState<'settings' | 'abandon' | null>(null);

  const newGame = () => (saved ? setSheet('abandon') : onNewGame());

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

  const newGameButton = (
    <button type="button" className={firstLaunch ? 'mbtn' : 'mbtn pri'} onClick={newGame}>
      <Icon name="plus" />
      <span className="mt">
        <b>{t('menu.new.title')}</b>
        <span>{t('menu.new.sub')}</span>
      </span>
    </button>
  );

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
            <HeroBoard cells={cells} />
          </div>
        )}

        <div className="mbtns">
          {saved && (
            <button type="button" className="mbtn alt" onClick={onContinue}>
              <Icon name="play" />
              <span className="mt">
                <b>{t('menu.continue.title')}</b>
                <ContinueSummary game={saved} lex={lex} />
              </span>
            </button>
          )}
          {firstLaunch ? (
            <>
              {learn}
              {newGameButton}
            </>
          ) : (
            <>
              {newGameButton}
              {learn}
            </>
          )}
        </div>
        <p className="mfoot">
          <span>{t('menu.footer')}</span>
        </p>
      </div>

      {desk && (
        <div className="menuright">
          <HeroBoard cells={cells} />
        </div>
      )}

      {sheet === 'settings' && (
        <SettingsSheet title={t('settings.title')} rows={['theme', 'highlight']} onClose={() => setSheet(null)} />
      )}
      {sheet === 'abandon' && (
        <Sheet title={t('menu.abandon.title')} onClose={() => setSheet(null)}>
          <p className="stext">{t('menu.abandon.body')}</p>
          <div className="orow">
            <button type="button" className="btn sec" onClick={() => setSheet(null)}>
              {t('menu.abandon.keep')}
            </button>
            <button type="button" className="btn pri" onClick={onNewGame}>
              {t('menu.abandon.confirm')}
            </button>
          </div>
        </Sheet>
      )}
    </Frame>
  );
}
