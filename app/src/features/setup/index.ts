/** Public API of the Play vs AI setup: the setup sheet, the remembered choice, and records per opponent. */

export { SetupSheet, type SetupSheetProps } from './SetupSheet';
export {
  DEFAULT_SETUP,
  FIRST_GAME_SETUP,
  humanColour,
  loadAiSetup,
  saveAiSetup,
  loadRecords,
  recordGame,
  type AiSetup,
  type AiRecord,
  type AiRecords,
} from './setup';
