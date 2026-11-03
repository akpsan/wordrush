/**
 * Wires the features into an app: which screen is showing, and moving between them.
 * Features never navigate themselves; they report what happened and the app decides.
 */

import { useMemo, useState } from 'react';
import { getLexicon } from '../dictionary';
import { clearSavedGame, GameScreen, loadSavedGame, type SavedSession } from '../features/game';
import { MenuScreen } from '../features/menu';
import { SettingsProvider } from '../features/settings';
import { TutorialScreen } from '../features/tutorial';
import { loadProgress, saveProgress, type Progress } from './progress';

type Screen =
  | { readonly name: 'menu' }
  | { readonly name: 'game'; readonly saved: SavedSession | null; readonly id: number }
  | { readonly name: 'tutorial'; readonly from: 'menu' | 'game' };

export default function App() {
  const lex = getLexicon();
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [progress, setProgress] = useState<Progress>(loadProgress);
  // Re-read the saved game whenever the menu is shown (a game may have just been saved or finished).
  const saved = useMemo(() => (screen.name === 'menu' ? loadSavedGame(lex) : null), [screen, lex]);

  const updateProgress = (patch: Partial<Progress>) => {
    const next = { ...progress, ...patch };
    setProgress(next);
    saveProgress(next);
  };

  const startGame = (saved: SavedSession | null) => {
    if (!saved) clearSavedGame();
    if (!progress.hasPlayed) updateProgress({ hasPlayed: true });
    setScreen({ name: 'game', saved, id: Date.now() });
  };

  return (
    <SettingsProvider>
      {screen.name === 'menu' && (
        <MenuScreen
          lex={lex}
          firstLaunch={!progress.tutorialSeen && !progress.hasPlayed}
          saved={saved?.game ?? null}
          onContinue={() => startGame(loadSavedGame(lex))}
          onNewGame={() => startGame(null)}
          onLearn={() => setScreen({ name: 'tutorial', from: 'menu' })}
        />
      )}
      {screen.name === 'game' && (
        <GameScreen
          key={screen.id}
          lex={lex}
          saved={screen.saved ?? undefined}
          onMenu={() => setScreen({ name: 'menu' })}
          onHelp={() => setScreen({ name: 'tutorial', from: 'game' })}
        />
      )}
      {screen.name === 'tutorial' && (
        <TutorialScreen
          lex={lex}
          onExit={(to) => {
            updateProgress({ tutorialSeen: true });
            if (to === 'menu') setScreen({ name: 'menu' });
            else startGame(loadSavedGame(lex)); // continue a saved game if there is one
          }}
        />
      )}
    </SettingsProvider>
  );
}
