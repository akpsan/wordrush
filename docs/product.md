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
| Any-direction words | Players don't expect one-way words; the owner's redesign mockup uses six directions | Let words run backwards too. Simulated 2026-11-13: fairness, length and skill unchanged (findings.md). Needs the TS engine, a new sim preset and conformance, the arrows, and new hex tutorial bump and box-in positions (SEA and THEM break) | 3 | 4 | 4 | 3.0 | Planned |
| Connect-the-sides mode | The owner's mockup shows "cells to connect · top ↕ bottom / left ↔ right" | A second goal: connect your two sides of the hexagon (like the board game Hex). Simulate first: fairness, length, whether words still matter | 3 | 2 | 5 | 1.2 | Idea |
| Redesign palette and font | The owner's mockup uses Lexend and a navy palette | Try them as theme tokens (bundled font), check contrast in both themes | 2 | 3 | 2 | 3.0 | Idea |

## Insights

| Date | Source | Finding |
| --- | --- | --- |
| 2026-11-13 | Simulator, 200 games per row | Two-way words on hex change almost nothing: Blue 47–48% (one way: 46%), 8.3 words per player (8.4), random beats balanced 16% (14%). Backwards words fill the same cells as forward words ending on a letter. |
| 2026-11-13 | AI calibration on hex, 40 games per pairing | Hard beats Medium 70% and Easy 73%; Medium beats Easy 65%. Against a casual player Hard (83%) isn't clearly above Medium (93%). Hard thinks up to 5.7s on hex; the app caps it at 2.5s. |
| 2026-11-12 | Owner playtest (live, hex) | A losing word looked like a normal one; the link badge hid the letter; slanted words are hard to follow; faded words nearly vanish; "ways out" meant nothing to players. |
| 2026-11-12 | Simulator, 300 games per setting | Hex fairness: radius 4 gave Blue 85% (balanced bots). Radius 5 with Blue's first word at most 3 letters: 52% / 44%. Adopted (`HEX`). |
| 2026-11-12 | Simulator | Hex games last about 8 words per player (square: 6). Random play beats the balanced bot 17% of the time on hex (23% on square). |
| 2026-11-12 | Owner playtest | It was hard to predict whether a word helps or hurts you. |

## Shipped

| Date | What | PR |
| --- | --- | --- |
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
