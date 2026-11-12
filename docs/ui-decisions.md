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

New exports are merged by hand, never copied over: Claude Design starts from its own copy, so each export brings back the old tutorial rows (OPEN, JAIL/POPE) and the "Decisions still open" section of `HANDOFF.md`. The 2026-11-04 export (Play vs AI screens and board clarity) was merged this way.

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
| Enter and Space after clicking a button | **They go to the game.** A button focused by a mouse or touch click (or given focus back when a sheet closes) doesn't take Enter or Space, so Enter still plays the word, like YouTube's player. A button reached with Tab does take them, for keyboard and screen-reader users. Implemented in `app/src/platform/keyboard.ts` by recording how each element got focus. |
| Accent colour after the game | The winner's colour (buttons, highlights). |
| Watch replay | **Dropped.** The mockups only show the button, not a replay screen, so it isn't built. The button is not shown. (`over.replay` stays in the copy deck, unused.) |

## Build decisions (menu, saved games, Learn to play)

| Topic | Decision |
| --- | --- |
| Saved game | Only the move list is saved. Continue replays it through the engine, so a damaged or out-of-date save is discarded rather than loading an illegal board. Finished games aren't saved. |
| First-launch menu | Shown until the player has finished or skipped Learn to play, or started a game. |
| Back to the menu from a game | A "Back to menu" button in the in-game menu sheet. The game stays saved for Continue. |
| Last button of Learn to play | **Play vs AI** starts an Easy game against Pip with you going first, and saves that as the remembered setup (as the design says). If a game is saved, the button reads **Continue** and resumes it instead, so finishing the tutorial never throws a game away. |
| Menu hero board | Built through the engine. The mockup's CUB and ARC became SUB and GAS, because CUB isn't in the word list. |
| Tutorial copy the deck doesn't list | "Type **CAT**" (step 7 before typing) and "Tap **Flip** to try the next spot." (a scripted word on another spot, outside step 4). |
| Tutorial keyboard after the bump | Inactive until "Got it", as in the mockup. |

## Build decisions (word list, accessibility, tests)

| Topic | Decision |
| --- | --- |
| What counts as a word | **The full playable list** (13,424 words: ENABLE minus 87 offensive words), decided with the product owner. The everyday list rejected common words (HUG, OWL, NAP, CRAB). Hints still suggest only everyday words. Simulated fairness under the current rules: Blue wins 53–55%. Details in `data/dictionaries/README.md`. |
| Tutorial's last lesson | **DOGS, boxed in by PLANT**, replacing JAIL and POPE. Under the full list, TAJ and RAJ escape JAIL, so the old lesson wasn't true in a real game. The new board leaves only one-square gaps, so it holds under any dictionary. The meter shows ways out, like the real game. Copy updated in the deck (`learn.8.*`). |
| Dark-theme Blue | **#256EF4** instead of the design's #3D7EF5: white text on the old blue was 3.8:1, below WCAG AA's 4.5:1. Same hue, slightly darker. |
| Contrast on the main menu button | The subtitle is no longer faded, and the "New? Start here" pill darkens the blue behind it instead of lightening it (WCAG AA). |
| "+n squares" under reduced motion | Hidden: it can't fade out without animation, so it would stay forever. The feedback line already says what was played. |
| Fonts | Bundled with the app (Fontsource), instead of loaded from Google Fonts: no third-party requests, works offline, stable screenshots. |

## Build decisions (board clarity)

The design's "fade by age + focus while typing" (dev note `devFade` in `canvas.json`), built in `app/src/features/game/model/board.ts`.

| Topic | Decision |
| --- | --- |
| Fading at rest | Each player's last word at full strength, the word before at 72% letter opacity, older words at **45%** (the design says 30%). Tiles keep their fill, shape, stripes and link dot. Age counts later words by the same player; a shared link letter takes the younger age. |
| Why 45%, not 30% | 30% letters were hard to read and far below WCAG text contrast. 45% still recedes clearly. Faded letters remain below AA, which is accepted: the setting below restores full contrast, and screen readers announce every letter regardless. |
| While typing | Every taken square outside **both** players' last words and the preview dims to 40%. The dev note dims the opponent's last word too, but the mockup keeps it bright; we follow the mockup, since you're placing your word against their latest move. |
| Empty squares | Lose their outline while fading is on, so a faded tile never looks empty. |
| Full contrast | When "Show all letters" is on (Settings, default off, in both the menu and in-game sheets), at the boxed-in moment and on the game-over board. The tutorial never fades: its lessons point at specific letters. |
| Motion | The typing dim fades over 0.2s; instant under reduced motion. |

## Build decisions (Play vs AI)

Built from the "vs AI" dev notes in `canvas.json` and section 5 of the copy deck. Where the two differ, the copy deck wins (it names the AI Pip, Juno or Rex; some dev notes still say "the computer").

| Topic | Decision |
| --- | --- |
| How each AI plays | **Easy (Pip):** short everyday words; about 1 move in 4 it plays one without checking its room. **Medium (Juno):** the simulator's "defensive" bot, keeping the most room for itself. **Hard (Rex):** the simulator's "lookahead" bot (its room minus yours, one reply ahead), plus a check of every move for an immediate box-in. Code: `app/src/ai/choose.ts`. |
| Words the AI plays | **Everyday words** (the hint list), falling back to the full list only when no everyday word fits. An AI that plays QAID or XYST feels unfair and teaches nothing; the fallback means it never loses to a gap in its own vocabulary. |
| Strength | Calibrated with `app/scripts/calibrate-ai.ts`; the order Easy < Medium < Hard holds clearly (`docs/findings.md`). |
| Thinking time | The design's minimums (Easy 0.8s, Medium 1.0s, Hard 1.4s, ±150ms). The search runs in a Web Worker, so the screen keeps animating. Hard stops looking after 2.5s and plays its best move so far. |
| Give up on the AI's turn | **Not available**, as in pass and play: only on your own turn. The design allows it during the AI's turn, but that turn lasts 1–2 seconds and allowing it would mean racing the AI's move. |
| Keys during the AI's turn | Ignored, not queued. On-screen keys and Play are `aria-disabled` (not `disabled`), so focus stays where it was. |
| Random start | Resolved when the game starts. Shown as the first line: "You're Blue this time. You go first!" on your first turn, or "You're Orange this time. Juno goes first." under the thinking line. |
| Your first word after the AI's | Still "End your word in the bottom-right corner": the first-word rule matters more than repeating the AI's word. |
| "Box them in!" | When the opponent is down to 1 way out, your turn's line says so (`cpu.danger.them`; `opp.danger.them` in pass and play). Your own danger line comes first. |
| Change difficulty | Opens the setup sheet over the menu, prefilled. Starting from it asks before replacing a saved game, like any new game. |
| Rematch | Same opponent and the same first-player choice; Random flips again. |
| Records | Wins, losses and games per opponent, on this device (`features/setup/setup.ts`). Only wins are shown ("Wins vs Rex: 4", or "No wins vs Rex yet"). Giving up counts as a loss. |
| Saved game | One slot for both modes. A new game of either mode replaces it (after asking). Saves are version 2 and record who's playing; version 1 saves load as pass and play. |
| Screen readers | One polite message per step (`cpu.sr.thinking`, `cpu.sr.played`, `cpu.sr.yourturn`), from a single live region. The AI's face is decorative; its card reads "Juno, Medium: 3 ways out". |

## Build decisions (small and short screens)

From an automated screenshot pass at 360×640, 390×844, 820×1180, 1280×640, 1366×657 and 1440×900 (2026-11-12).

| Topic | Decision |
| --- | --- |
| Desktop layout on laptops | **From 600px high** (was 700px). Common laptop windows (1366×768 or 1280×720 screens) are about 640–660px high inside the browser and got the narrow phone column. The board already scales with the window height. |
| Desktop sheets on short screens | Sit 160px down on tall screens, rise to 24px from the top on short ones, and scroll if still too tall, so Start game is never below the fold. |
| Board letters when the board is squeezed | Scale with the board (at most 20px), so tiles never spill out of a small board. |
| Tutorial's last screen on short phones | The recap list is tighter so the finished board keeps its room. |
| Narrow phones (under 375px wide) | The "New? Start here" pill wraps to two lines instead of squeezing the button title, and two-button rows (Change difficulty · Rematch) stay on one line. |

## Build decisions (experience improvements, 2026-11-12)

The product owner gave creative freedom here: the design is a direction, not a spec.

| Topic | Decision |
| --- | --- |
| Rings on letters you can build from | Drawn **inside** the tile. Outside rings touched their neighbours' in a word and read as one heavy block. |
| Results: Share result | A link under the results shares "{title} · WordRush" and the site link: the system share sheet on touch devices, the clipboard elsewhere ("Copied!"). No board or words, so nothing is spoiled. Code: `platform/share.ts`. Strings `over.share*` in overrides. |
| Results: Back to menu in pass and play | Added next to Share result. Before, pass and play's results only offered Play again; the menu was behind the hamburger. |
| Installable app | Web app manifest, icons (the logo's blue dot and orange square on the dark background) and theme colour, so the game can be added to a phone's home screen and opens full screen. No offline service worker yet. |
| Offline play | A hand-written service worker (`app/public/sw.js`, registered by `platform/offline.ts` in production builds only). Pages are network-first, so a new deploy shows at once; everything else (hashed scripts, styles, fonts, the word list) is cache-first. After one visit, the whole game works offline. |
| Browser bar colour | Follows the theme (`platform/themeColor.ts`): the dark or light background, so the bar blends in. |
| Tablet menu | On tall portrait screens (at least 600×900, phone layout) the hero board is 420px instead of 286px, instead of leaving empty space. |

## Build decisions (hex mode, 2026-11-12)

The product owner chose a honeycomb board as the game's direction. Rules and simulation evidence: [rules.md](rules.md) (Hex mode) and [findings.md](findings.md) (Hex mode).

| Topic | Decision |
| --- | --- |
| Where the shape lives | One rule field, `shape` (`'square'` or `'hex'`), in the simulator (`engine/geometry.py`) and the app (`engine/geometry.ts`). Cells keep their row × column index; a hexagon of radius R sits in a (2R + 1) × (2R + 1) array in axial coordinates, and the corners outside it are off the board. Square presets are unchanged, so the conformance replay still passes. |
| Line directions | Across, down (down-right on screen) and down-left. Every word reads left to right or downwards, the same rule as the square board with one more line. |
| Corners | Blue starts in the hexagon's top-left corner, Orange ends in its bottom-right one, as on the square. A player starts with 3 ways out instead of 2. |
| Drawing the board | A hexagon "slot" per cell, with the usual tiles (Blue round, Orange square and striped) centred on it. Tiles keep every existing state (rings, previews, fading) without hex-specific versions. Positions are percentages from `features/game/components/hexLayout.ts`, shared with the menu's hero board. |
| Choosing the board | Settings → Board: **Hexagon** (default) or Square. It applies to new games; a game in progress keeps its shape, and saves record it (saves without a shape are square). The AI worker receives the shape with the move list. |
| Menu hero board | Follows the Board setting. The hex position is two Easy AIs' first ten words, replayed through the engine. |
| Learn to play | Still teaches on the square board. Porting it is on the product backlog. |
| First-word note | Shows the board's own limit ({n} in the copy deck): 4 letters on the square, 3 on the hexagon. |

## Build decisions (word impact, 2026-11-12)

From the owner's playtest: it was hard to tell whether a word helps or hurts. First item of the product loop.

| Topic | Decision |
| --- | --- |
| What it shows | Once a word is ready (a real word in a legal spot), the note row above the tiles says what playing it would do: "After **ATE**: you 6 ways out (−1), Orange 10 (same)", or "**PLANT** boxes Orange in!". Before the opponent's first word, only your own count. |
| Where | The note row, which is always rendered (it holds the first-word note), so nothing on screen moves. A hint chip, when hints are on, keeps the row. |
| Doesn't reveal the word list | It appears only in the ready state, which already confirms the word. |
| How | `features/game/model/impact.ts` plays the word on a copy through the engine and counts ways out (`waysOut`) for both players. Your own count at 1 or less gets the warning icon. |
| Not in the tutorial | The tutorial's lessons control that row themselves. |

## Build decisions (words to play, heatmap, losing words, 2026-11-12)

From the owner's playtest on the live hex game.

| Topic | Decision |
| --- | --- |
| Words to play, not ways out | The cards count the words a player could play next, shown as **1, 2 or 3+** ("3+ words to play", "1 word left!"). "Ways out" (directions a word can grow) didn't say anything a player could use. Boxed in is still 0 words, so the rules don't change. Danger lines say "down to 1 word". Copy deck rows `ways.*`, `type.danger`, `wait.danger`, `cpu.*danger*`, `opp.danger.them` and the glossary changed; the tutorial's meter (`learn.8.*`) still counts ways out. |
| Heatmap | Empty cells are tinted in the mover's colour by how many of their playable words pass through them: 1, 2 to 4, 5 or more. With a ready word, the tint shows where the mover could go next after playing it. Only on your own turn; never on the START and END corners (their marks need the contrast). Hex boards tint the hexagon slot. Settings: "Show where words fit", on by default, in both settings sheets. `heatCounts` in `features/game/model/board.ts`. |
| Losing words | A ready word that leaves you no words to play says "**RIM** leaves you no words. You would lose!" in bold with a warning icon, and Play turns into an outlined, striped warning button. It can still be played. |
| Impact line | Uses the same counts: "After **ATE**: you 3+ words, Orange 2 words". |
| Link badge on hex | Smaller and pushed into the tile's corner, so it no longer covers the link letter. |
