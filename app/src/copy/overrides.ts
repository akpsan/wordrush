/**
 * Strings that aren't a 1:1 row in the copy deck. Keep this list short, and record every
 * addition or change in docs/ui-decisions.md.
 */

/** Deck rows that describe several strings at once, split into one ID per string. */
const composite = {
  'settings.theme.auto': 'Auto',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'learn.flip': 'Flip',
  'learn.play': 'Play',
} as const;

/** Changes to deck wording, required by decisions in docs/ui-decisions.md. */
const changed = {
  // Tab stays reserved for focus; Space flips.
  'desk.keys': 'Just type! **Enter** to play · **Space** to flip · **⌫** to delete',
  // The deck names Orange; on one shared device either player can give up.
  'giveup.body':
    "{opponent} wins if you give up. No rush, there's no timer. And there's definitely a word that fits, or the game would already be over!",
} as const;

/**
 * Pass and play on one device: both players are "you", so results are told in the third person.
 * Same voice as the deck's "you" versions (over.lost.*, over.won.*, over.gaveup.*).
 */
const passAndPlay = {
  'over.boxed.title': '{winner} boxed {loser} in!',
  'over.boxed.sub': '{WORD} ran out of room on turn {n}. Rematch?',
  'over.gaveup.title.pp': '{loser} gave up',
  'over.gaveup.sub.pp': '{winner} takes this one. Up for a rematch?',
  'boxed.continue.aria': 'See results',
} as const;

/** Text the mockups show but the deck doesn't list (board marks, screen-reader labels). */
const missing = {
  'board.start': 'START',
  'board.end': 'END',
  'cell.aria': 'Row {row}, column {col}: {content}',
  'cell.aria.letter': '{L}, {owner}',
  'cell.aria.empty': 'empty',
  'cell.aria.preview': '{L}, preview',
  'entry.aria': 'Your word: {word}',
  'entry.aria.empty': 'empty',
  'keyboard.aria': 'Keyboard',
  'board.aria': 'Board',
  'status.aria': 'Turn and ways out',
  'nav.menu': 'Back to menu',
  // Learn to play: lines the tutorial needs that the deck's step list doesn't cover.
  'learn.7.empty': 'Type **CAT**',
  'learn.flip.generic': 'Tap **Flip** to try the next spot.',
  'learn.recap.aria': 'The rules',
} as const;

export const overrides = { ...composite, ...changed, ...passAndPlay, ...missing };
