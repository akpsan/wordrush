/** The game screen: assembles the header, status bar, board and controls for one game. */

import { useMemo, useState } from 'react';
import { t } from '../../copy';
import type { GameState, Lexicon } from '../../engine';
import { useIsDesktop } from '../../platform/media';
import { useKeyboardCommands, type KeyCommand } from '../../platform/keyboard';
import { Frame } from '../../ui/Frame';
import { SettingsSheet, useResolvedTheme, useSettings } from '../settings';
import { Actions, KeyHelp } from './components/Actions';
import { Board } from './components/Board';
import { BoxedInPanel, GameOverPanel } from './components/EndPanels';
import { Entry } from './components/Entry';
import { GiveUpSheet } from './components/GiveUpSheet';
import { Header } from './components/Header';
import { Keyboard } from './components/Keyboard';
import { StatusBar } from './components/StatusBar';
import { boardView } from './model/board';
import { feedbackFor } from './model/feedback';
import { letterChoices, playerStatus, turnStatus } from './model/status';
import { useGame } from './useGame';

type Overlay = 'settings' | 'giveUp' | null;

export interface GameScreenProps {
  readonly lex: Lexicon;
  /** A saved game to continue. Omit to start a new one. */
  readonly initialGame?: GameState;
  /** Back to the main menu (from the menu sheet). The game stays saved. */
  readonly onMenu: () => void;
  /** Opens Learn to play from the "?" button. */
  readonly onHelp?: () => void;
}

export function GameScreen({ lex, initialGame, onMenu, onHelp }: GameScreenProps) {
  const { settings } = useSettings();
  const theme = useResolvedTheme();
  const desk = useIsDesktop();
  const { session, entry, dispatch } = useGame(lex, initialGame);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const { game } = session;
  const result = game.result;
  const stage = !result ? 'playing' : result.reason === 'boxed-in' && !session.resultsShown ? 'boxed' : 'over';
  const playing = stage === 'playing';

  const players = useMemo(
    () => [playerStatus(session, lex, 0), playerStatus(session, lex, 1)] as const,
    [session, lex],
  );
  const cells = useMemo(
    () => boardView(session, entry, lex, { showWaysOut: settings.showWaysOut }),
    [session, entry, lex, settings.showWaysOut],
  );
  const feedback = useMemo(() => feedbackFor(session, entry, lex), [session, entry, lex]);
  const highlight = useMemo(
    () => new Set(playing && settings.highlightLetters ? letterChoices(game, game.toMove) : []),
    [playing, settings.highlightLetters, game],
  );

  useKeyboardCommands((c: KeyCommand) => {
    switch (c.kind) {
      case 'letter':
        return dispatch({ type: 'letter', letter: c.letter });
      case 'delete':
        return dispatch({ type: 'delete' });
      case 'play':
        return dispatch({ type: 'play' });
      case 'flip':
        return dispatch({ type: 'flip' });
      case 'escape':
        return dispatch({ type: 'escape' });
    }
  }, playing && overlay === null);

  return (
    <Frame theme={theme} layout={desk ? 'desk' : 'phone'} accent={result ? result.winner : game.toMove}>
      <Header
        onMenu={() => setOverlay('settings')}
        onGiveUp={() => setOverlay('giveUp')}
        canGiveUp={playing}
        onHelp={onHelp}
      />
      <StatusBar players={players} turn={turnStatus(game)} />
      <Board cells={cells} onFlip={() => dispatch({ type: 'flip' })} onFilter={(cell) => dispatch({ type: 'filter', cell })} />
      <section className="bottom">
        {playing && (
          <>
            <Entry
              entry={entry}
              feedback={feedback}
              problemId={session.problem?.id ?? null}
              firstWordNote={game.toMove === 0 && game.lastWord[0] === null}
            />
            <Keyboard
              enabled
              highlight={highlight}
              onLetter={(letter) => dispatch({ type: 'letter', letter })}
              onDelete={() => dispatch({ type: 'delete' })}
            />
            <Actions entry={entry} enabled onFlip={() => dispatch({ type: 'flip' })} onPlay={() => dispatch({ type: 'play' })} />
            <KeyHelp />
          </>
        )}
        {stage === 'boxed' && <BoxedInPanel game={game} onContinue={() => dispatch({ type: 'showResults' })} />}
        {stage === 'over' && <GameOverPanel game={game} onPlayAgain={() => dispatch({ type: 'newGame' })} />}
      </section>

      {overlay === 'settings' && (
        <SettingsSheet
          title={t('gsettings.title')}
          rows={['highlight', 'waysOut']}
          onClose={() => setOverlay(null)}
          extra={
            <button type="button" className="btn sec" onClick={onMenu}>
              {t('nav.menu')}
            </button>
          }
        />
      )}
      {overlay === 'giveUp' && (
        <GiveUpSheet
          player={game.toMove}
          onKeepPlaying={() => setOverlay(null)}
          onGiveUp={() => {
            setOverlay(null);
            dispatch({ type: 'giveUp' });
          }}
        />
      )}
    </Frame>
  );
}
