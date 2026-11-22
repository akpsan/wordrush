/** The game screen: assembles the header, status bar, board and controls for one game. */

import { useEffect, useRef, useState } from 'react';
import { plain, t } from '../../copy';
import { geometryOf, otherPlayer, type GameResult, type GameState, type Lexicon } from '../../engine';
import { useIsDesktop, usePrefersReducedMotion } from '../../platform/media';
import { useKeyboardCommands, type KeyCommand } from '../../platform/keyboard';
import { Frame } from '../../ui/Frame';
import { SettingsSheet, useResolvedTheme, useSettings } from '../settings';
import { KeyHelp } from './components/Actions';
import { Board } from './components/Board';
import { BoxedInPanel, GameOverPanel } from './components/EndPanels';
import { Entry } from './components/Entry';
import { GiveUpSheet } from './components/GiveUpSheet';
import { Header } from './components/Header';
import { Keyboard } from './components/Keyboard';
import { StatusBar } from './components/StatusBar';
import { aiAnnouncement } from './model/feedback';
import { FRIEND, nameOf, type Match } from './model/match';
import type { SavedSession } from './persistence';
import { turnStatus } from './model/status';
import { useGame } from './useGame';
import { useAiTurn, type AiPhase } from './useAiTurn';
import { useGameView } from './useGameView';

type Overlay = 'settings' | 'giveUp' | null;

export interface GameScreenProps {
  readonly lex: Lexicon;
  /** A saved game to continue. Omit to start a new one (with the hints setting at that moment). */
  readonly saved?: SavedSession;
  /** Back to the main menu (from the menu sheet). The game stays saved. */
  readonly onMenu: () => void;
  /** Opens Learn to play from the "?" button. */
  readonly onHelp?: () => void;
  /** Who's playing a new game (ignored when continuing a saved one). Defaults to pass and play. */
  readonly match?: Match;
  /** Called once when a game ends, so the app can keep records. */
  readonly onGameOver?: (game: GameState, match: Match) => void;
  /** Vs AI: the person's wins against this opponent, shown on the results. */
  readonly aiWins?: number;
  /** Vs AI: a new game against the same opponent (the app starts it; Random re-rolls). */
  readonly onRematch?: () => void;
  /** Vs AI: open the setup sheet to pick another opponent. */
  readonly onChangeOpponent?: () => void;
}

export function GameScreen(props: GameScreenProps) {
  const { lex, saved, onMenu, onHelp, onGameOver, aiWins, onRematch, onChangeOpponent } = props;
  const { settings } = useSettings();
  const theme = useResolvedTheme();
  const desk = useIsDesktop();
  const reducedMotion = usePrefersReducedMotion();
  const { session, entry, dispatch } = useGame(
    lex,
    saved ? { saved } : { hintsPerGame: settings.hints, match: props.match ?? FRIEND, shape: settings.board },
  );
  const [overlay, setOverlay] = useState<Overlay>(null);
  const { phase, skip } = useAiTurn(session, dispatch, reducedMotion);

  const view = useGameView(session, entry, lex, phase, settings);
  const { game, match, result, stage, playing, yourTurn, players, cells, feedback, aiTurn, hint, impact, highlight } = view;
  const left = view.hintsLeft;

  useReportGameOver(result, phase, () => onGameOver?.(game, match));

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
  }, yourTurn && overlay === null);

  return (
    <Frame theme={theme} layout={desk ? 'desk' : 'phone'} accent={result ? result.winner : game.toMove}>
      <Header
        onMenu={() => setOverlay('settings')}
        onGiveUp={() => setOverlay('giveUp')}
        canGiveUp={yourTurn}
        onHelp={onHelp}
        hintsLeft={left}
        onHint={() => dispatch({ type: 'hint' })}
      />
      <StatusBar players={players} turn={turnStatus(session)} thinking={phase === 'thinking'} />
      <Board
        cells={cells}
        onFlip={() => dispatch({ type: 'flip' })}
        onFilter={(cell) => dispatch({ type: 'filter', cell })}
        onTap={phase === 'playing' ? skip : undefined}
        geo={geometryOf(game.rules)}
      />
      {match.mode === 'ai' && (
        <p className="sr" role="status">
          {aiAnnouncement(session, phase)}
        </p>
      )}
      <section className="bottom">
        {playing && (
          <>
            <Entry
              entry={entry}
              feedback={feedback}
              problemId={session.problem?.id ?? null}
              firstWordNote={game.toMove === 0 && game.lastWord[0] === null ? game.rules.firstWordMaxLen : null}
              impact={impact}
              hint={hint}
              aiTurn={aiTurn}
              stepper={yourTurn ? { onPrev: () => dispatch({ type: 'flipBack' }), onNext: () => dispatch({ type: 'flip' }) } : null}
            />
            <Keyboard
              enabled={yourTurn}
              highlight={highlight}
              onLetter={(letter) => dispatch({ type: 'letter', letter })}
              onDelete={() => dispatch({ type: 'delete' })}
              play={{
                ready: entry.ready,
                losing: impact?.tone === 'err',
                label: entry.ready ? plain('btn.play.ready', { WORD: entry.typed.toUpperCase() }) : plain('btn.play'),
                onPlay: () => dispatch({ type: 'play' }),
              }}
            />
            <KeyHelp />
          </>
        )}
        {stage === 'boxed' && <BoxedInPanel game={game} onContinue={() => dispatch({ type: 'showResults' })} />}
        {stage === 'over' && (
          <GameOverPanel
            game={game}
            hintsUsed={session.hints.perGame > 0 ? session.hints.used : null}
            match={match}
            onPlayAgain={match.mode === 'ai' && onRematch ? onRematch : () => dispatch({ type: 'newGame' })}
            aiWins={aiWins}
            onChangeOpponent={onChangeOpponent}
            onMenu={onMenu}
          />
        )}
      </section>

      {overlay === 'settings' && (
        <SettingsSheet
          title={t('gsettings.title')}
          rows={['highlight', 'heatmap', 'waysOut', 'showAll']}
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
          opponent={nameOf(match, otherPlayer(game.toMove))}
          onKeepPlaying={() => setOverlay(null)}
          onGiveUp={() => {
            setOverlay(null);
            dispatch({ type: 'giveUp' });
          }}
          hintsLeft={left}
          onHint={() => {
            setOverlay(null);
            dispatch({ type: 'hint' });
          }}
        />
      )}
    </Frame>
  );
}

/** Calls `report` once per finished game, after the AI's winning word (if any) has appeared. */
function useReportGameOver(result: GameResult | null, phase: AiPhase, report: () => void) {
  const reported = useRef<GameResult | null>(null);
  const latest = useRef(report);
  latest.current = report;
  useEffect(() => {
    if (!result || phase === 'playing' || reported.current === result) return;
    reported.current = result;
    latest.current();
  }, [result, phase]);
}
