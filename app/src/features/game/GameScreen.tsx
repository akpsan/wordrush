/** The game screen: assembles the header, status bar, board and controls for one game. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../copy';
import { geometryOf, otherPlayer, type GameResult, type GameState, type Lexicon } from '../../engine';
import { useIsDesktop, usePrefersReducedMotion } from '../../platform/media';
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
import { aiAnnouncement, aiTurnView, feedbackFor } from './model/feedback';
import { FRIEND, isAi, nameOf, type Match } from './model/match';
import { impactLine } from './model/impact';
import { hintView } from './model/hint';
import { hintsLeft } from './model/session';
import type { SavedSession } from './persistence';
import { letterChoices, playerStatus, turnStatus } from './model/status';
import { useGame } from './useGame';
import { AI_LETTER_MS, useAiTurn, type AiPhase } from './useAiTurn';

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

  const { game, match } = session;
  const result = game.result;
  // While the AI's word appears, the game carries on looking like play, even if that word won.
  const stage = !result || phase === 'playing' ? 'playing' : result.reason === 'boxed-in' && !session.resultsShown ? 'boxed' : 'over';
  const playing = stage === 'playing';
  const aiBusy = phase !== 'idle';
  const yourTurn = playing && !aiBusy && !isAi(match, game.toMove);
  const lastPlayByAi = session.lastPlay !== null && isAi(match, game.words[session.lastPlay.wordIndex]!.player);

  useReportGameOver(result, phase, () => onGameOver?.(game, match));

  const players = useMemo(
    () => [playerStatus(session, lex, 0), playerStatus(session, lex, 1)] as const,
    [session, lex],
  );
  const cells = useMemo(
    () =>
      boardView(session, entry, lex, {
        showWaysOut: settings.showWaysOut && !aiBusy,
        showAnchors: !aiBusy,
        fade: !settings.showAllLetters,
        aiReveal: lastPlayByAi ? (phase === 'playing' ? AI_LETTER_MS : 0) : undefined,
        heat: settings.showHeatmap && yourTurn,
      }),
    [session, entry, lex, settings.showWaysOut, settings.showAllLetters, settings.showHeatmap, yourTurn, aiBusy, lastPlayByAi, phase],
  );
  const feedback = useMemo(() => feedbackFor(session, entry, lex), [session, entry, lex]);
  const aiTurn = useMemo(() => (phase === 'idle' ? null : aiTurnView(session, lex, phase)), [session, lex, phase]);
  const hint = useMemo(() => hintView(session), [session]);
  const left = session.hints.perGame > 0 ? hintsLeft(session) : null;
  // What the ready word does to both players' ways out (docs/ui-decisions.md, word impact).
  const impact = useMemo(() => (yourTurn ? impactLine(session, entry, lex) : null), [yourTurn, session, entry, lex]);
  const highlight = useMemo(
    () => new Set(yourTurn && settings.highlightLetters ? letterChoices(game, game.toMove) : []),
    [yourTurn, settings.highlightLetters, game],
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
  }, yourTurn && overlay === null);

  return (
    <Frame theme={theme} layout={desk ? 'desk' : 'phone'} accent={result ? result.winner : game.toMove}>
      <Header
        onMenu={() => setOverlay('settings')}
        onGiveUp={() => setOverlay('giveUp')}
        canGiveUp={yourTurn}
        onHelp={onHelp}
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
            />
            <Keyboard
              enabled={yourTurn}
              highlight={highlight}
              onLetter={(letter) => dispatch({ type: 'letter', letter })}
              onDelete={() => dispatch({ type: 'delete' })}
            />
            <Actions
              entry={entry}
              enabled={yourTurn}
              onFlip={() => dispatch({ type: 'flip' })}
              onPlay={() => dispatch({ type: 'play' })}
              hintsLeft={left}
              onHint={() => dispatch({ type: 'hint' })}
              losing={impact?.tone === 'err'}
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
