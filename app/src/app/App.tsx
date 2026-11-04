/**
 * Wires the features into an app: which screen is showing, and moving between them.
 * Features never navigate themselves; they report what happened and the app decides.
 */

import { useMemo, useState } from 'react';
import { getLexicon } from '../dictionary';
import type { GameState } from '../engine';
import { clearSavedGame, FRIEND, GameScreen, loadSavedGame, type Match, type SavedSession } from '../features/game';
import { MenuScreen } from '../features/menu';
import { SettingsProvider } from '../features/settings';
import {
  FIRST_GAME_SETUP,
  humanColour,
  loadAiSetup,
  loadRecords,
  recordGame,
  saveAiSetup,
  type AiRecords,
  type AiSetup,
} from '../features/setup';
import { TutorialScreen } from '../features/tutorial';
import { loadProgress, saveProgress, type Progress } from './progress';

type Screen =
  | { readonly name: 'menu'; readonly showSetup?: boolean }
  | { readonly name: 'game'; readonly saved: SavedSession | null; readonly match: Match; readonly id: number }
  | { readonly name: 'tutorial' };

/** A vs-AI game from a setup: Random is resolved now, and the AI gets a fresh seed. */
const aiMatch = (setup: AiSetup): Match => ({
  mode: 'ai',
  level: setup.level,
  first: setup.first,
  human: humanColour(setup.first),
  seed: Math.floor(Math.random() * 2 ** 31),
});

export default function App() {
  const lex = getLexicon();
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [aiSetup, setAiSetup] = useState<AiSetup | null>(loadAiSetup);
  const [records, setRecords] = useState<AiRecords>(loadRecords);
  // Re-read the saved game whenever the menu or tutorial is shown (a game may have just been saved or finished).
  const saved = useMemo(() => (screen.name !== 'game' ? loadSavedGame(lex) : null), [screen, lex]);

  // Functional update: the tutorial's last button and the game it starts both update progress.
  const updateProgress = (patch: Partial<Progress>) =>
    setProgress((current) => {
      const next = { ...current, ...patch };
      saveProgress(next);
      return next;
    });

  const openGame = (saved: SavedSession | null, match: Match) => {
    if (!saved) clearSavedGame();
    updateProgress({ hasPlayed: true, lastMode: match.mode });
    setScreen({ name: 'game', saved, match, id: Date.now() });
  };
  const playAi = (setup: AiSetup) => {
    saveAiSetup(setup);
    setAiSetup(setup);
    openGame(null, aiMatch(setup));
  };
  const continueGame = (game: SavedSession) => openGame(game, game.match);

  const onGameOver = (game: GameState, match: Match) => {
    if (match.mode !== 'ai' || !game.result) return;
    setRecords((r) => recordGame(r, match.level, game.result!.winner === match.human));
  };

  const game = screen.name === 'game' ? screen : null;
  const gameMatch = game ? (game.saved?.match ?? game.match) : FRIEND;

  return (
    <SettingsProvider>
      {screen.name === 'menu' && (
        <MenuScreen
          lex={lex}
          firstLaunch={!progress.tutorialSeen && !progress.hasPlayed}
          saved={saved}
          aiSetup={aiSetup}
          lastMode={progress.lastMode}
          records={records}
          showSetup={screen.showSetup}
          onContinue={() => saved && continueGame(saved)}
          onPlayAi={playAi}
          onPlayFriend={() => openGame(null, FRIEND)}
          onLearn={() => setScreen({ name: 'tutorial' })}
        />
      )}
      {game && (
        <GameScreen
          key={game.id}
          lex={lex}
          saved={game.saved ?? undefined}
          match={game.match}
          onMenu={() => setScreen({ name: 'menu' })}
          onHelp={() => setScreen({ name: 'tutorial' })}
          onGameOver={onGameOver}
          aiWins={gameMatch.mode === 'ai' ? records[gameMatch.level].wins : undefined}
          onRematch={gameMatch.mode === 'ai' ? () => playAi({ level: gameMatch.level, first: gameMatch.first }) : undefined}
          onChangeOpponent={() => setScreen({ name: 'menu', showSetup: true })}
        />
      )}
      {screen.name === 'tutorial' && (
        <TutorialScreen
          lex={lex}
          hasSavedGame={saved !== null}
          onExit={(to) => {
            updateProgress({ tutorialSeen: true });
            if (to === 'menu') setScreen({ name: 'menu' });
            else if (saved) continueGame(saved);
            else playAi(FIRST_GAME_SETUP);
          }}
        />
      )}
    </SettingsProvider>
  );
}
