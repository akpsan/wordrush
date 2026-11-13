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
  // Word impact: shown once a word is ready (docs/ui-decisions.md).
  'impact.both': 'After **{WORD}**: you {you}, {opp} {them}',
  'impact.you': 'After **{WORD}**: you {you} to play',
  'impact.boxes': '**{WORD}** boxes {opp} in!',
  'impact.lose': '**{WORD}** leaves you no words. You would lose!',
  'impact.n': '{n} words',
  'impact.one': '1 word',
  // Heatmap and words to play (docs/ui-decisions.md).
  'settings.heatmap.label': 'Show where words fit',
  'settings.heatmap.help': 'Empty squares glow where more of your words could go.',
  'settings.heatmap.aria': 'Show where words fit: {on/off}',
  // Direction marks: words only read left to right or downwards (docs/ui-decisions.md).
  'type.backwards': '**{WORD}** would read backwards here. Words go left to right or downwards',
  // Learn to play on the hexagon (docs/ui-decisions.md): the steps whose words differ from the square board.
  'learn.hex.2.coach': 'Start in the top-left corner. Type **TEA**!',
  'learn.hex.2.note': 'First word: 3 letters max',
  'learn.hex.2.empty': 'Tap the letters to spell **TEA**',
  'learn.hex.2.ready': '**TEA** fits! Play it.',
  'learn.hex.4.coach': 'Start or end on any letter of your last word. Type **ARM**.',
  'learn.hex.4.flip': 'Nice! Now tap **Flip** to send it down from the A.',
  'learn.hex.4.ready': '**ARM** fits! Play it.',
  'learn.hex.6.coach': 'Your word can also end on one of your letters. Type **CAR**.',
  'learn.hex.6.ready': '**CAR** ends on your R. Play it!',
  'learn.hex.7.coach': 'Every letter blocks the way, even yours. Try **SEA**, ending on your A.',
  'learn.hex.7.empty': 'Type **SEA**',
  'learn.hex.7.bump.coach': 'Your C, E and A are in the way, so SEA has no way in to your A.',
  'learn.hex.7.bump.line': 'No room: your own letters are in the way.',
  'learn.hex.8.coach': "Your opponent's last word, THEM, has one way out left. Close it off with **RACE**.",
  'learn.hex.8.ready': '**RACE** closes off THEM. Play it!',
  'learn.hex.8.won.coach': 'THEM has no room left: every gap is too small for a word. **You win!**',
  // Game screen redesign (docs/ui-decisions.md): the spot stepper and Play in the keyboard.
  'stepper.ready': '**{WORD}** fits · spot {i} of {n}',
  'stepper.partial': 'Spot {i} of {n}',
  'stepper.prev.aria': 'Previous spot',
  'stepper.next.aria': 'Next spot',
  // Hex mode (docs/ui-decisions.md).
  'settings.board.label': 'Board',
  'settings.board.help': 'For new games. On the hexagon, words also run down to the left.',
  'settings.board.hex': 'Hexagon',
  'settings.board.square': 'Square',
  // Results: share the outcome (no board, no words: nothing to spoil).
  'over.share': 'Share result',
  'over.share.copied': 'Copied!',
  'over.share.failed': "Couldn't share",
  'over.share.text': '{title} · WordRush',
} as const;

export const overrides = { ...composite, ...opponents, ...changed, ...passAndPlay, ...missing };
