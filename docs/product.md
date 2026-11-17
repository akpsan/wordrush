# WordRush product state

The product loop's memory (`/product-loop`, `.claude/skills/product-loop/`). This file is the source of truth: nightly runs can't reach the shared product doc (https://claude.ai/artifact/E65v4kRwrsM6t1Xw38kGtn), so they read and update this file, and mirror to the doc when they can. The owner steers by editing the backlog here or commenting on the doc.

**Goal:** a fun, easy-to-pick-up time waster for people of every skill level.

## Backlog

Score = impact × confidence ÷ effort (each 1–5). Highest first. Status: Idea, Planned, Next, Building, Shipped, Dropped.

| Item | Problem | Idea | Impact | Confidence | Effort | Score | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Direction marks on the preview | Words on slanted hex lines are hard to follow; players don't expect one-way words | A small arrow on the previewed word's tiles; say so when a word would only fit backwards | 3 | 4 | 2 | 6.0 | Shipped |
| Calmer shared danger state | When both players are on 1 word, both cards shout equally | Keep the alarm for the mover; a quieter warning on the other card | 2 | 4 | 1 | 8.0 | Shipped |
| Impact line with hints on | The hint chip takes the note row, so the impact line disappears | Show both, or move the impact into the feedback line when a hint is shown | 3 | 3 | 2 | 4.5 | Shipped |
| Hex tiles and faded contrast | On hex, faded older words nearly vanish; round/square tiles don't match hexagon cells | Hexagon-shaped tiles (keep a different border or pattern per player), stronger faded contrast on hex | 4 | 3 | 3 | 4.0 | Shipped |
| Small phones on hex | On 360×640 the 91-cell hexagon has cells about 16px | Tighter controls on short screens, or a bigger board share | 3 | 3 | 3 | 3.0 | Shipped |
| AI strength on hex | The AI levels were calibrated on the square board | Run `app/scripts/calibrate-ai.ts` on hex (small sample) and tune if Easy < Medium < Hard breaks | 3 | 3 | 2 | 4.5 | Shipped |
| Learn to play on hex | The tutorial still teaches the square board while games default to hex | Rebuild the scripted lessons on the hexagon (split into lessons; one per run) | 3 | 4 | 4 | 3.0 | Shipped |
| Any-direction words | Players don't expect one-way words; the owner's redesign mockup uses six directions | Let words run backwards too. Simulated 2026-11-13: fairness, length and skill unchanged (findings.md). Split 2026-11-14: slice 1 (sim preset `HEX2`, TS engine, conformance) shipped; the rest is the three rows below; all shipped 2026-11-15 | 3 | 4 | 4 | 3.0 | Shipped |
| Two-way words: arrows and feedback | The arrows and the "would read backwards" line assume one-way words; the new directions (left, up, up-right) have no arrow yet | Arrows for all six directions (← ↖ ↗ on hex); under two-way rules drop the "reads backwards" message, since backwards fits | 3 | 4 | 2 | 6.0 | Shipped |
| Two-way words: hex tutorial | The hex lessons' SEA bump and RACE-boxes-in-THEM positions break when words can run backwards | New bump and box-in positions that hold under `HEX_TWO_WAY_RULES`; check with the scripted-lesson tests | 3 | 3 | 3 | 3.0 | Shipped |
| Two-way words: turn it on | The app still plays one-way hex | Make `HEX_TWO_WAY_RULES` the hex rules (after arrows and tutorial); recalibrate the AIs (small sample), since about 3× more legal moves could slow Hard past its 2.5s cap | 3 | 3 | 2 | 4.5 | Shipped |
| AI thinking time on two-way hex | Uncapped, Hard's median move takes 2.6s (95th percentile 8.1s), so in the app most of its moves stop at the 2.5s cap and it plays below its calibrated strength; Medium has no cap and peaks at 3.1s | Calibrate with the app's cap; speed up move scoring, or cap Medium too. Check on a mid-range phone | 3 | 3 | 3 | 3.0 | Shipped |
| Hard on slow phones | On this server Hard's slowest move is now 1.7s (95th percentile 1.5s); a mid-range phone may be 2–4× slower, so the 2.5s cap may still cut some moves short | Time the AI on a real mid-range phone (or a throttled browser); if the cap bites, look one reply deeper only when time allows | 2 | 3 | 2 | 3.0 | Shipped |
| Snappier Hard on phones | On a mid-range phone Hard's turn takes 1.7s typically and up to 3.3s: the 2.5s budget is only checked between candidates, so it overshoots | Check the budget inside each candidate, and try a lower budget (e.g. 1.5s): capping cost no measurable strength at 2.5s | 2 | 3 | 1 | 6.0 | Idea |
| Dead-end warning | A word that leads into a dead end looks fine: "3+ words" and the impact line count words, not how far they lead (findings.md, Decided before the end) | Owner, 2026-11-17: build it next. Count room (words you could chain alone) for the impact line, and warn "Only room for 1 more word after this" | 4 | 3 | 3 | 4.0 | Shipped |
| Room on the player cards | The cards' "3+ words to play" still counts words, so a player in a dead end can read 3+ there while the impact line warned them | Show room on the cards too (e.g. "1 word left" when room is 1), using `roomOf` | 3 | 3 | 2 | 4.5 | Idea |
| AIs avoid dead ends | Medium and Hard walk into dead ends in 20–35% of games when a way out exists | Value room (a short solo search, like analyze-endgames.ts) instead of the number of legal words; recalibrate | 3 | 3 | 3 | 3.0 | Idea |
| Skip the decorative moves | Once a player is doomed, about 3 moves are left to play out | Say it when it happens ("Orange is trapped: 1 word left") and offer to finish; or end the game there (a rule change: simulate first) | 3 | 2 | 3 | 2.0 | Idea |
| Connect-the-sides mode | The owner's mockup shows "cells to connect · top ↕ bottom / left ↔ right" | A second goal: connect your two sides of the hexagon (like the board game Hex). **Owner, 2026-11-16: an extra mode alongside the box-in game, not a replacement**; the current rules and default stay. Simulate first: fairness, length, whether words still matter | 3 | 2 | 5 | 1.2 | Idea |
| Redesign palette and font | The owner's mockup uses Lexend and a navy palette | Try them as theme tokens (bundled font), check contrast in both themes | 2 | 3 | 2 | 3.0 | Idea |

## Insights

| Date | Source | Finding |
| --- | --- | --- |
| 2026-11-17 | 6–8 Medium-vs-Hard games on two-way hex, up to 12–15 everyday-word candidates per turn | About 11% of candidate words (176 of 1,560) lead into a dead end (room 1 or 2), and the old impact line showed every one of them as "2 words" or "3+". Room search cost: median 9ms, 95th percentile 48ms on this server with a 400-position budget, which finds as many dead ends as 1,000. |
| 2026-11-16 | AI timing in a CPU-throttled browser (`time-ai-throttled.ts`, 101 positions) and capped calibration (`calibrate-ai.ts … 625`, 40 games per pairing) | On a 4× slower CPU (a mid-range phone) Hard's budget runs out on 31% of moves (50% at 6×); Hard's turn: median 1.7s, max 3.3s; Medium max 1.2s. Capping costs no measurable strength: capped Hard beats Novice 93%, Easy 73%, Medium 63% (uncapped: 90%, 65%, 65%). |
| 2026-11-16 | Owner playtest, then 80 sim and 60 app-AI games on two-way hex (`analyze-endgames.ts`) | Confirmed: in 85–95% of games the loser's own word dooms them (at most 2 more words even if the opponent did nothing), about 3 moves before the end. In 20–35% of AI games a way out existed. Room is misjudged because the AIs and the game's numbers count words, not how far they lead. |
| 2026-11-16 | Owner report, then every feedback message measured at 360–414px | The feedback line wrapped: "Orange played STONE. Start or end with" plus five letter chips never fit on one line, and four error lines and "No spot yet" wrapped at 360–375px. |
| 2026-11-16 | Owner playtest, then measured at 390×844, 390×700 and 390×664 | The board jumped when the spot stepper appeared: up 4–6px when it showed (36px against a 20px feedback line), down again on an error line. |
| 2026-11-16 | Owner playtest (iPhone, browser with toolbars) | "Touch areas for the keyboard is kind of awkward." In a phone browser the visible screen is under 680px tall, so keys are 33px (Apple suggests 44); the 4–6px gaps and the middle row's 16px insets didn't respond to taps; keys acted on click, which the browser drops when a fast tap slides. |
| 2026-11-15 | AI benchmark, 12 games with Hard on two-way hex | Most of the AI's time went into listing every legal move just to count them, and into listing all of the opponent's moves after each word to see whether they're boxed in. Counting without building the list, and stopping at the first move found, makes it about 5× faster with identical moves: Hard median 2.4s → 0.45s (max 11.5s → 1.7s), Medium 0.7s → 0.11s (max 2.7s → 0.27s). |
| 2026-11-15 | AI calibration on two-way hex, 40 games per pairing | Easy < Medium < Hard holds: Medium beats Easy 60%, Hard beats Easy 65% and Medium 65% (one-way: 65%, 73%, 70%). Against a casual player 68% / 80% / 90%, so Hard is now clearly above Medium (one-way: Medium 93%, Hard 83%). Thinking time grew: Hard median 2.6s uncapped (max 10.9s), Medium median 0.6s (max 3.1s). |
| 2026-11-15 | Tutorial check under two-way rules | No everyday word linked to CAR is blocked any more: early in a game, open cells surround every letter, so a full bump is rare. The lesson keeps SEA's bump, scoped to "this way". THEM has two ways out; RACE still closes both. |
| 2026-11-14 | Conformance, 80 two-way hex games | The TS engine matches the simulator move for move under `HEX2`. Two-way words give far more choices: 2,835 legal moves at turn 3 of one game, against 975 with the same board one-way. Expect slower AI turns and a busier heatmap. |
| 2026-11-13 | Simulator, 200 games per row | Two-way words on hex change almost nothing: Blue 47–48% (one way: 46%), 8.3 words per player (8.4), random beats balanced 16% (14%). Backwards words fill the same cells as forward words ending on a letter. |
| 2026-11-13 | AI calibration on hex, 40 games per pairing | Hard beats Medium 70% and Easy 73%; Medium beats Easy 65%. Against a casual player Hard (83%) isn't clearly above Medium (93%). Hard thinks up to 5.7s on hex; the app caps it at 2.5s. |
| 2026-11-12 | Owner playtest (live, hex) | A losing word looked like a normal one; the link badge hid the letter; slanted words are hard to follow; faded words nearly vanish; "ways out" meant nothing to players. |
| 2026-11-12 | Simulator, 300 games per setting | Hex fairness: radius 4 gave Blue 85% (balanced bots). Radius 5 with Blue's first word at most 3 letters: 52% / 44%. Adopted (`HEX`). |
| 2026-11-12 | Simulator | Hex games last about 8 words per player (square: 6). Random play beats the balanced bot 17% of the time on hex (23% on square). |
| 2026-11-12 | Owner playtest | It was hard to predict whether a word helps or hurts you. |

## Shipped

| Date | What | PR |
| --- | --- | --- |
| 2026-11-17 | Dead-end warning: the impact line says "**WORD** is a dead end: room for 1 more word" when a ready word leaves only 1 or 2 words you could chain, even with words to play left. New engine `roomOf` | PR_LINK |
| 2026-11-16 | Hard on slow phones, measured: on a mid-range phone Hard's budget runs out on about a third of its moves, but that costs no measurable strength, so no change to the AI. New `scripts/time-ai-throttled.ts`; `calibrate-ai.ts` takes a budget | akpsan/wordrush#34 |
| 2026-11-16 | Feedback line on one line: the opponent's word moves to the note row, shorter error lines, and an e2e guard that every feedback message fits at 360px | akpsan/wordrush#32 |
| 2026-11-16 | No layout shift from the spot stepper: the feedback line and the stepper share one height, so the board stays put while typing | akpsan/wordrush#31 |
| 2026-11-16 | Keyboard touch areas: taps in the gaps and the middle row's insets land on the nearest key, keys act on touch-down, a pressed state, no long-press selection | akpsan/wordrush#30 |
| 2026-11-15 | AI thinking time: about 5× faster AI turns with identical moves (engine counts moves without listing them; the boxed-in check stops at the first move). Hard's median turn 2.4s → 0.45s, so it rarely hits the 2.5s cap now | akpsan/wordrush#28 |
| 2026-11-15 | Two-way words on the hexagon: new hex games use `HEX_TWO_WAY_RULES` (words read either way along all three lines). Tutorial copy for the bump ("this way") and box-in ("two ways out"), Board setting help, screen-reader directions in words, AI levels recalibrated | akpsan/wordrush#26 |
| 2026-11-15 | Two-way words, arrows and feedback: an arrow for all six directions (hex: → ↘ ↙ ← ↖ ↗), and no "would read backwards" line under two-way rules | akpsan/wordrush#25 |
| 2026-11-14 | Any-direction words, slice 1 (engine only, no visible change): sim preset `HEX2`, `HEX_TWO_WAY_RULES` in the TS engine (directions left, up, up-right), and an 80-game two-way conformance fixture | akpsan/wordrush#24 |
| 2026-11-13 | Game screen redesign from the owner's mockup: Play in the keyboard, a spot stepper instead of Flip, letter chips, logo-left header with the hint button, bigger slots and board | feature/game-screen-redesign |
| 2026-11-13 | AI on hex: calibrated (40 games per pairing); Easy < Medium < Hard holds head to head, no tuning needed. `calibrate-ai.ts` takes a board | akpsan/wordrush#21 |
| 2026-11-13 | Learn to play on the hexagon: follows the Board setting; TEA, DOG, ARM, BIG, CAR, the SEA bump and RACE boxing in THEM; tutorial meter counts words | akpsan/wordrush#20 |
| 2026-11-13 | Small phones: on screens 680px tall or less, tighter keys (33px), slots, buttons and gaps give the board back 43px; on 360×640 the hexagon grows from 241px to 284px tall (cells 23px → 27px wide) | akpsan/wordrush#19 |
| 2026-11-13 | Impact line with hints on: once a word is ready, its impact takes the note row from the hint chip | akpsan/wordrush#18 |
| 2026-11-13 | Direction marks: an arrow (→ ↓ ↘ ↙) on each previewed letter; "**WORD** would read backwards here" when letters only fit right to left or upwards | akpsan/wordrush#17 |
| 2026-11-13 | Calmer shared danger: only the player about to move gets the pulsing alarm at 1 word; the other card keeps its warning icon | akpsan/wordrush#16 |
| 2026-11-13 | Hexagon tiles on the hex board: fills on the hexagon slots, every ring and outline (your letters, previews, boxed-in explanation) as a hexagon ring; stronger faded letters on hex | akpsan/wordrush#15 |
| 2026-11-13 | Words to play (1, 2, 3+), heatmap of where your words fit, losing-word warning, smaller hex link badge | akpsan/wordrush#9 (released in #10) |
| 2026-11-12 | Word impact preview | akpsan/wordrush#4 |
| 2026-11-12 | Hex mode (91-cell honeycomb, default board) | akpsan/wordrush#3 (released in #8) |
| 2026-11-12 | Offline play, theme-coloured browser bar, bigger tablet menu board | akpsan/wordrush#2 |
| 2026-11-12 | Small-phone and laptop layout fixes, Share result, installable app | akpsan/wordrush#1 |

## Nightly runs

One line per scheduled run: date, what happened, PR or stop reason. Newest first.

| Date | Result |
| --- | --- |
| 2026-11-17 | Built the Next item (owner's pick), Dead-end warning (effort 3): engine `roomOf`, the impact line warns about dead ends, computed off the typing path. Unit tests pin a real position (ABLE showed 3+ words with room for 1); copy-fit, hex, flows and vs-ai specs. Follow-up: Room on the player cards. PR_LINK |
| 2026-11-16 | No Next/Planned item; took the top-scoring Idea that fits, Hard on slow phones (effort 2; tied with the palette, which would change the look the owner kept). Measured in a 4×/6× throttled browser and with a capped calibration (240 games): the cap bites on a third to half of Hard's moves but costs no strength, so no AI change. Follow-up: Snappier Hard on phones. The endgame findings (#33) are still unmerged after GitHub errors: not this run's PR. akpsan/wordrush#34 |
| 2026-11-15 | Built the top Planned item, AI thinking time (effort 3): the engine counts moves for the AI without building them, and the boxed-in check stops early. Same moves, about 5× faster (Hard median 2.4s → 0.45s). 12 benchmark games; vs-ai and hex e2e specs. akpsan/wordrush#28 |
| 2026-11-14 | No Next/Planned item of effort 3 or less, so built slice 1 of Any-direction words (engine, sim preset, conformance; 240 sim games for fixtures). Split the rest into three rows. No UI change, so no e2e specs or screenshots. akpsan/wordrush#24 |
