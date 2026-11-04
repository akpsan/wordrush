/**
 * Public API of the game feature. Other features (the menu, the tutorial) use only these.
 * The tutorial reuses the real board, entry and keyboard so it teaches the actual game.
 */

export { GameScreen, type GameScreenProps } from './GameScreen';
export { loadSavedGame, clearSavedGame, type SavedSession } from './persistence';
export { waysOutFor, playerStatus, letterChoices, type PlayerStatus } from './model/status';
export { boardView, type CellView } from './model/board';
export { entryView, type EntryView } from './model/entry';
export { createSession, type Session } from './model/session';
export { FRIEND, type Match, type AiMatch, type FirstChoice } from './model/match';
export type { Feedback, FeedbackTone } from './model/feedback';
export { Board } from './components/Board';
export { Entry } from './components/Entry';
export { Keyboard } from './components/Keyboard';
