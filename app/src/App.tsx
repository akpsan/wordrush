/** Wires features into screens. For now the app opens straight into a pass-and-play game. */

import { getLexicon } from './dictionary';
import { GameScreen } from './features/game';
import { SettingsProvider } from './features/settings';

export default function App() {
  return (
    <SettingsProvider>
      <GameScreen lex={getLexicon()} />
    </SettingsProvider>
  );
}
