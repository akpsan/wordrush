/** Player settings: what they are, their defaults, and how they're stored. */

export type ThemeSetting = 'auto' | 'light' | 'dark';
export type HintsPerGame = 0 | 1 | 3;

export interface Settings {
  readonly theme: ThemeSetting;
  /** Off by default (docs/ui-decisions.md). Both players get the same number. */
  readonly hints: HintsPerGame;
  /** Mark the player's letters on the on-screen keyboard. */
  readonly highlightLetters: boolean;
  /** Dots on the remaining exits when a player is down to 1 or 2 ways out. */
  readonly showWaysOut: boolean;
  /** Keep every letter at full strength (older words fade when off). */
  readonly showAllLetters: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  hints: 0,
  highlightLetters: true,
  showWaysOut: true,
  showAllLetters: false,
};

/** Accept only known fields with valid values, so old or edited saves can't break the app. */
export function sanitize(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  return {
    theme: r.theme === 'light' || r.theme === 'dark' || r.theme === 'auto' ? r.theme : DEFAULT_SETTINGS.theme,
    hints: r.hints === 0 || r.hints === 1 || r.hints === 3 ? r.hints : DEFAULT_SETTINGS.hints,
    highlightLetters: typeof r.highlightLetters === 'boolean' ? r.highlightLetters : DEFAULT_SETTINGS.highlightLetters,
    showWaysOut: typeof r.showWaysOut === 'boolean' ? r.showWaysOut : DEFAULT_SETTINGS.showWaysOut,
    showAllLetters: typeof r.showAllLetters === 'boolean' ? r.showAllLetters : DEFAULT_SETTINGS.showAllLetters,
  };
}
