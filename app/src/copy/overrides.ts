/**
 * Strings that aren't a 1:1 row in the copy deck. Keep this list short, and record every
 * addition or change in docs/ui-decisions.md.
 */

/** Deck rows that describe several strings at once, split into one ID per string. */
const composite = {
  'settings.theme.auto': 'Auto',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.hints.off': 'Off',
  'learn.flip': 'Flip',
  'learn.play': 'Play',
  'menu.cpu.whoFirst.you': 'you go first',
  'menu.cpu.whoFirst.ai': '{ai} goes first',
  'menu.cpu.whoFirst.random': 'random start',
  'menu.continue.cpu.turn.you': 'your move',
  'menu.continue.cpu.turn.ai': "{ai}'s move",
  'cpu.setup.first.you': 'You',
  'cpu.setup.first.ai': '{ai}',
  'cpu.setup.first.random': 'Random',
} as const;

/** The AI opponents table (copy deck section 5) has its own shape, so its rows are listed here. */
const opponents = {
  'ai.easy.name': 'Pip',
  'ai.medium.name': 'Juno',
  'ai.hard.name': 'Rex',
  'ai.easy.level': 'Easy',
  'ai.medium.level': 'Medium',
  'ai.hard.level': 'Hard',
  'ai.easy.desc': 'Pip plays short, everyday words and sometimes forgets to leave room. Great for warming up.',
  'ai.medium.desc': 'Juno plays solid words and always keeps a way out.',
  'ai.hard.desc': 'Rex plans ahead and tries to box you in. Good luck!',
} as const;

/** Changes to deck wording, required by decisions in docs/ui-decisions.md. */
const changed = {
  // Tab stays reserved for focus; Space flips.
  'desk.keys': 'Just type! **Enter** to play · **Space** to flip · **⌫** to delete',
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
  'over.stats.hints': 'Hints used',
  // Results: share the outcome (no board, no words: nothing to spoil).
  'over.share': 'Share result',
  'over.share.copied': 'Copied!',
  'over.share.failed': "Couldn't share",
  'over.share.text': '{title} · WordRush',
} as const;

export const overrides = { ...composite, ...opponents, ...changed, ...passAndPlay, ...missing };
