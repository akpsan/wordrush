# UI decisions

Decisions on the open questions from the design handoff (`design/handoff/`), made Nov 3, 2026. The product owner delegated these calls. Where the handoff's dev notes disagree with this file or with the copy deck, this file and the copy deck win.

## Source-of-truth order

1. [rules.md](rules.md) (current rules v4) for game logic.
2. `design/handoff/wordrush-copy-deck.md` for every player-facing string, used exactly as written.
3. This file for behavior.
4. The handoff dev notes (`design/handoff/design/canvas.json`, `notes`) for everything else.

The handoff's dev notes use older words (Rotate, Place, Resign, cornered, cells). The app uses the copy deck's words: Flip, Play, Give up, boxed in, squares.

## Handoff files

The handoff zip also contained 34 state files that weren't on the design canvas: leftovers from earlier rounds (timeouts, passing, suggestion cards, the old tutorial). They were removed from `design/handoff/`. Every remaining file is current. The one known mismatch: the interactive `Tutorial.dc.html` mockup still uses OPEN in step 7 (see below).

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| What the "ways out" meter counts | **Real playable words**, using the same check as "boxed in". "Ways out" shows the number of directions with at least one real word (anchor letter × start or end × across or down), so the meter reaches 0 exactly when the player is boxed in. | The meter is always truthful, and it matches the tutorial's "63 → 0" story. With a local trie it's cheap enough. |
| Tutorial step 7 (OPEN fits going down) | **Use CAT instead of OPEN** (applied to the copy deck). CAT can only end on your T, and coming down onto the T it runs into the E of your own TEAM. There's no spot anywhere, so the real engine produces the bump. This is verified in `app/src/engine/__tests__/engine.test.ts`. Copy changes: `learn.7.coach` → "Every letter blocks the way, even yours. Try **CAT**, ending on your T." · `learn.7.bump.coach` → "Your E is in the way, so CAT can't come down onto your T." · `learn.7.bump.line` → "No room: your own **E** is in the way." | The lesson must match what the real engine does. |
| Hints | **Default Off.** Options Off / 1 / 3, the same for both players. Hint use is shown in the results only, not live. | The core game should stand on its own. Hints are a setting for people who want them. |
| Who goes first in a rematch | **Alternate.** The player who goes first is Blue and gets the 4-letter first-word limit. | Fairest across a series of games. |
| When Give up is available | **Only on your own turn.** | On a shared device, that's when you're holding it. |
| Desktop key to flip | **Space only.** Tab keeps its normal job of moving focus. Enter plays, Backspace deletes, arrow keys also flip, and Esc clears the letter filter, then the entry. | Taking over Tab breaks keyboard navigation and screen readers. |
| Straight-line continuation from your last word | **Allowed** when the cells are empty. | It already works this way in the engine and the simulations. |
| Adjacency | **Ignored.** Letters touching side by side don't need to form words. | Rules v4. |
| "Already played" | **Includes both players' words.** | Rules v4 and the engine. |
| Live feedback must not reveal the word list | **Agreed (as the designer proposed).** "Fits so far" and "no spot yet" use board geometry only. Whether a word is real is shown only in the ready state or when the player tries to play it. | Stops players probing the word list letter by letter. |

## Build decisions (game screen)

| Topic | Decision |
| --- | --- |
| "You" tag | Not shown in pass and play: both players are on the same device. It returns with online play. |
| Results wording | Pass and play uses third-person results ("Blue boxed Orange in!", "Orange gave up"), in the same voice as the deck's "you" versions. Strings: `over.boxed.*`, `over.gaveup.*.pp` in `app/src/copy/overrides.ts`. |
| Strings the deck doesn't list | START and END corner marks, and screen-reader labels for cells, the entry and the keyboard, are in `app/src/copy/overrides.ts`. |
| Ways out before the first word | The player about to start sees "2 ways out" (across or down from their corner), as in the mockup. The other player shows "—" until their first word. |
| Animations that loop in the mockups | "+n squares" and the opponent's-word flash play once in the app. The mockups loop them only so they're visible on a static canvas. |
| Key caps on desktop buttons | Only Play shows its key (Enter). The Space cap on Flip didn't fit the 360px column with the "1 of 2" counter; the help line under the buttons already says Space flips. |
| Flipped spot while editing | **Kept.** The design reset the preview to the first spot on every key press. Now the chosen spot (its letter, start or end, and direction) is kept while the word still fits there, and falls back to the first spot otherwise. Flipping TEA down and adding M keeps TEAM going down. |
| Accent colour after the game | The winner's colour (buttons, highlights). |
| Features not built yet | Hints and Watch replay are hidden until their features exist, so no button does nothing. |

## Build decisions (menu, saved games, Learn to play)

| Topic | Decision |
| --- | --- |
| Saved game | Only the move list is saved. Continue replays it through the engine, so a damaged or out-of-date save is discarded rather than loading an illegal board. Finished games aren't saved. |
| First-launch menu | Shown until the player has finished or skipped Learn to play, or started a game. |
| Back to the menu from a game | A "Back to menu" button in the in-game menu sheet. The game stays saved for Continue. |
| "Play now" at the end of Learn to play | Continues the saved game if there is one, otherwise starts a new game. |
| Menu hero board | Built through the engine. The mockup's CUB and ARC became SUB and GAS, because CUB isn't in the word list. |
| Tutorial copy the deck doesn't list | "Type **CAT**" (step 7 before typing) and "Tap **Flip** to try the next spot." (a scripted word on another spot, outside step 4). |
| Tutorial keyboard after the bump | Inactive until "Got it", as in the mockup. |
