# Word Chain Grid: Rules and Dry Runs

Nov 3, 2026 · @Luffy

## Overview

Two players race to claim cells on a shared grid by placing words, where each new word must grow out of their own previous word. It plays like Tron light cycles crossed with Shiritori: your chain is a path, the opponent's letters are walls, and a 20-second timer keeps it frantic.

The rules below are a v1 that resolves the open questions from the original idea. The dry runs and the simulation test them, and the last section lists what to change.

## Current rules: v4

Decided Nov 3, 2026 after the simulation batches ([findings.md](findings.md)). Compared with Rules v1: revive, crossing and the turn timer are gone, a cornered player loses, and A's first word is shorter for fairness. Everything from "Rules v1" onward is kept as history. (Rules v3, used earlier the same day, was the same except that a stuck player passed and B started with +0.5.)

**Setup**

1. Grid: 8 × 8. Two players, A and B, alternate turns. A goes first.
2. Words: 3 to 5 letters. Any word in the playable list counts: the ENABLE word list minus offensive words (`data/dictionaries/`). A word already on the board can't be played again.
3. Words read left to right or top to bottom only.
4. **Typing:** players type their own words on an on-screen keyboard (Wordle-style), then choose the placement.

**Placing words**

1. **First word:** A's first word starts in the top-left corner and has **at most 4 letters**. B's first word ends in the bottom-right corner (3 to 5 letters, as usual).
2. **Chaining:** every later word must start or end on a letter of your own most recent word. That letter's cell is shared by both words.
3. **No crossing:** apart from that shared cell, every cell of the new word must be empty. Every other letter on the board is a wall.
4. **Adjacency is ignored:** letters touching side by side don't have to form words.

**Winning**

1. **Cornered loses:** if no word fits from any letter of your most recent word at the start of your turn, you lose.
2. **Full board:** if the grid fills before anyone is cornered, the player who owns more cells wins, and B wins a tie. (This never happened in 9,000 simulated games.)

**No timer.** There are no turn limits, so there are no timeout rules.

**Why A's first word is shorter:** with "cornered loses" and no handicap, B wins slightly more often (54–56%), because when both players get boxed in during the same round, the player whose turn comes next loses. A's 4-letter first word brings it to 48–57% for A across bot styles, the fairest result tested. A 4-letter maximum for everyone and a bonus for B were also tested ([findings.md](findings.md)).

## Hex mode

Added Nov 12, 2026 as the game's direction (the product owner chose a honeycomb board). Simulator preset `HEX` in `engine/rules.py`; evidence in [findings.md](findings.md#hex-mode). Everything in Rules v4 applies, except:

1. **Board:** a hexagon of 91 cells (radius 5, 6 cells to a side), drawn as a honeycomb.
2. **Lines:** words run across (left to right), down-right or down-left. Every word reads left to right or downwards.
3. **First word:** A starts in the top-left corner of the hexagon, with **at most 3 letters**; B ends in the bottom-right corner, as usual.

**Why radius 5 and a 3-letter first word:** on a radius-4 hexagon (61 cells), A won 85% of games between balanced bots. Radius 5 with A's usual 4-letter first word was fair for balanced bots (48%) but not aggressive ones (31% for A). Cutting A's first word to 3 letters made both fair: 52% and 44% for A, over 300 games each.

## Rules v1

**Setup**

1. Grid: 8 × 8 by default. Two players, A and B, alternate turns. A goes first.
2. Words: 3 to 5 letters, from a shared dictionary. A word already on the board can't be played again by either player.
3. Words read left to right or top to bottom only.

**Placing words**

1. **First word:** anywhere it fits in empty cells.
2. **Chaining:** every later word must *start* on a letter of your own last word. That letter's cell is shared: the new word's first letter sits on top of it.
   - The default anchor is the **last letter** of your last word.
   - You may use **any letter** of your last word instead. It only matters when the last letter is boxed in.
3. **No crossing:** apart from the shared anchor cell, every cell of the new word must be empty. Opponent letters and your own older letters are walls.
4. **Adjacency is ignored:** letters touching side by side don't have to form words.

**Timer and timeout**

1. Each turn has 20 seconds.
2. **Timeout while a move exists:** your last word is removed. Its cells are freed, except a cell another word still uses (such as the anchor it shared with your previous word). Your previous word becomes your new "last word."
3. **Zero words, you lose:** if a timeout leaves you with no words on the board (your only word is removed, or you time out on your very first move), you lose immediately and the opponent wins, whatever the cell count.

**Stuck and game end**

1. **Stuck** means no legal move exists from any letter of your last word. The game checks this at the start of your turn; you don't wait out the timer.
2. The game ends when either player is stuck, or the grid is full.

**Scoring**

1. Score = number of cells you own. A shared anchor cell counts once, for its original owner.
2. Tie-break: fewer timeouts, then fewer words played (longer words win).

## Dry run 1: the drift, and winning by getting stuck

Rules v1 as written, 8 × 8. Both players drift to the bottom edge in 8 moves, and A wins *because* A gets stuck. Uppercase letters are A's, lowercase are B's.

| # | Player | Word | Placement | Note |
| --- | --- | --- | --- | --- |
| 1 | A | HANDY | down from row 0 | First word, near the top-left |
| 2 | B | STAMP | down from row 1 | First word |
| 3 | A | HEARD | right, from the H | Chains from the *first* letter: the Y at the bottom has less room |
| 4 | B | ALT | right, from the A |  |
| 5 | A | ROVER | down, from the R |  |
| 6 | B | LET | down, from the L |  |
| 7 | A | ROWS | down, from the last R | Reaches the bottom row |
| 8 | B | THE | down, from the T | Seals A's last exits, while behind |
| 9 | A | stuck |  | Game ends: **A 16, B 11** |

After move 8:

```
. H E A R D . .
. A . . O s . .
. N . . V t . .
. D . . E a l t
. Y . . R m e .
. . . . O p t .
. . . . W . h .
. . . . S . e .
```

**What it shows**

- **The drift is fast.** Every word sits right of or below the one before it. Both chains hit the bottom row by move 8, with 58% of the grid still empty.
- **Stuck-ends-the-game rewards the leader for getting stuck.** A was boxed in and won. B's last move trapped A and handed A the win. Under this rule, trapping the opponent is only good when you're ahead, and getting trapped is fine when you're ahead.

## Dry run 2: the wall

Rules v1, 8 × 8. B wins in 6 moves by parking words directly alongside A's. A bot that looks one move ahead found this "wall" on its own and kept using it.

| # | Player | Word | Placement | Note |
| --- | --- | --- | --- | --- |
| 1 | A | RISEN | right, row 0 | First word |
| 2 | B | EAGLE | right, row 1 | Directly under RISEN: every downward exit is gone |
| 3 | A | NOT | right, from the N | Only 13 legal words left, all forced into the corner |
| 4 | B | GAMES | down, from the G |  |
| 5 | A | OUGHT | down, from the O | Pinned against the right edge |
| 6 | B | SLOTS | right, from the S | Runs under OUGHT and seals it |
| 7 | A | stuck |  | Game ends: **B 13, A 11** |

Final board:

```
. R I S E N O T
. e a g l e U .
. . . a . . G .
. . . m . . H .
. . . e . . T .
. . . s l o t s
. . . . . . . .
. . . . . . . .
```

**What it shows**

- **One parallel word can kill a chain.** A word can only leave right or down, so a word laid alongside closes every exit on that side at once.
- **The second player's first word is a free weapon.** "First word anywhere" lets B drop EAGLE straight onto A on move 2. A never gets to build.
- **Edges are walls too.** A's NOT and OUGHT were pushed into the right edge, which did half of B's work.

## Simulation results

Rules v1 as written produce games of about 2 words per player, with 70% of the board left empty. Start-or-end chaining and crossing each roughly double the game's length, and the full set of fixes (V5) fills 90% of the board with near-even win rates.

Setup: 150 games per variant on 8 × 8, between two bots that score each move by cells gained plus their own options next turn minus the opponent's. The dictionary is about 2,900 common English words of 3–5 letters. A "human timer" models the 20-second limit: the fewer legal words exist, the likelier a timeout.

| Variant | Words per player | Board filled | A wins | B wins | Ties | Games of ≤ 4 words total | Avg. score gap (cells) | Timeouts per game |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V1: rules as written | 2.4 | 28% | 33% | 13% | 53% | 59% | 1.3 | 0 |
| V2: V1, but a stuck player passes | 3.5 | 37% | 27% | 65% | 7% | 9% | 6.6 | 0 |
| V3: V2 + start *or end* on the chain letter | 6.3 | 67% | 47% | 47% | 6% | 0% | 11.2 | 0.1 |
| V4: V3 + corner starts | 6.7 | 73% | 52% | 38% | 10% | 0% | 5.1 | 0.1 |
| V5: V4 + cross on a matching letter | 13.6 | 90% | 51% | 46% | 3% | 0% | 8.3 | 6.9 |
| V6: V5 + timed-out word is banned + stuck player revives from any own word (120 games) | 13.5 | 99% | 58% | 37% | 6% | 0% | 8.6 | 4.4 |

**What the numbers say**

- **V1 games are over in about 2 words each, and half are ties.** The second player's first word walls off the first player (dry run 2), and often each player has just one 5-letter word.
- **Passing alone hands the game to B.** Under V2, B wins 65%: the move-2 wall still works, and now B keeps scoring afterward.
- **Start-or-end fixes the drift; corners fix the wall.** V3 doubles game length. V4 halves the score gap, because nobody can be smothered on move 2.
- **Crossing doubles the game again, but timeouts explode.** Late in a V5 game, few words fit, so the timer starts to bite. 1% of V5 games hit the 200-turn safety cap, from the timeout loop in dry run 3.
- **Banning the timed-out word ends the loop.** V6 had no runaway games, timeouts fell from 6.9 to 4.4 per game, and 68% of games ran until the grid was full.
- **The first player keeps an edge.** From V4 on, A wins 51–58% against B's 37–46%. With 120–150 games per row the exact gap is noisy (about ±9 points), but the direction is consistent.
- **A bigger grid doesn't save V1.** With simpler bots, V1 gives 1.5, 2.3 and 3.0 words per player on 6 × 6, 8 × 8 and 10 × 10. V3 gives 3.3, 6.2 and 8.1.
- **Some letters are traps.** In the word list, 463 words end in E but only 61 start with it; for Y it's 198 against 25, and nothing starts with X. Under start-only chaining, ending on E, Y, K or X boxes you in. S, T and D are safe exits. This is a nice strategic layer worth keeping.

## Recommended changes: Rules v2

Keep the core (chain from your own last word, 3–5 letters, 20-second timer, score by cells) and make six changes. Together they turn a 2-word game into a 13-word game that fills the board.

| # | Change | Fixes | Evidence |
| --- | --- | --- | --- |
| 1 | A new word may **start or end** on the chain letter | Drift into the bottom-right | V2 → V3: 3.5 → 6.3 words per player |
| 2 | **Fixed starts:** A's first word starts in the top-left corner; B's first word ends in the bottom-right corner | The move-2 wall | V3 → V4: score gap 11.2 → 5.1 cells |
| 3 | A word may **cross** any cell whose letter matches, but must add **at least 2 new cells** | Board left empty; the cheap +1 (ACRE → ACRES) | V4 → V5: 73% → 90% filled. The 2-cell minimum is untested |
| 4 | **Stuck:** if your last word has no move, chain from any of your words; only if none works, pass. The game ends when both players pass in a row or the grid is full | Frozen players; "get stuck to win" | V5 → V6: 90% → 99% filled |
| 5 | **Timeout:** your last word is removed **and can't be played again** this game. If that leaves you with no words (including a timeout on move 1), you lose immediately | The place-remove-place loop; the free restart after losing every word | V6: no runaway games, timeouts 6.9 → 4.4 per game. The zero-words loss is untested |
| 6 | **8 × 8** for a full game, **6 × 6** for a quick one | Game length | About 13 vs 9 words per player |

**Still open**

- **First-player edge.** A wins about 55% to B's 40%. Options to test: B scores +2 cells at the end, or A's first word is capped at 3 letters.
- **Timer pressure late in the game.** Under v2, timeouts cluster at the end, when few words fit. Watch whether 20 seconds feels unfair there; 30 seconds may suit the endgame better.
- **Dictionary.** The word list decides how forgiving the game is. A list of everyday words (as simulated) keeps it fast; a full Scrabble list would make it much easier to escape tight spots.
- **Trap letters.** Under start-or-end chaining, ending on E or Y is far less punishing, since many words *end* in E and Y. That removes some strategy. If you miss it, an untested middle ground is to allow ending on the chain letter only when no word can start on it.

## Dry run 3: patched rules, and a new loop

This game uses the fixes the first two runs point to, on a 6 × 6 grid: A starts in the top-left corner, B ends its first word in the bottom-right corner, a word may start *or end* on the chain letter, a word may cross any cell whose letter matches, and a stuck player passes. The board fills to 83%, but two new problems appear.

| # | Player | Word | Placement | Note |
| --- | --- | --- | --- | --- |
| 1 | A | TODAY | down from the corner | Corner start |
| 2 | B | TOTAL | right, into the corner | Corner start |
| 3 | A | DRINK | right, from the D |  |
| 4 | B | SKULL | down, *ending* on the L | Start-or-end lets B climb upward |
| 5 | A | NEAT | down, from the N | Crosses B's T in TOTAL |
| 6 | B | PEARL | right, ending on the L | Crosses A's A in NEAT |
| 7 | A | ACRE | right, ending on the E | Crosses its own A in TODAY |
| 8 | B | timeout |  | PEARL removed; the shared A and L stay |
| 9 | A | ACRES | right, from the A | Replays ACRE plus one S: a cheap +1 |
| 10 | B | RES | right, ending on the S |  |
| 11 | A | STIR | down, ending on the R |  |
| 12 | B | stuck |  | Frozen for the rest of the game |
| 13–25 | A | SPA, TIRE, TIRE, TIRE |  | Three timeouts: TIRE is placed, removed, placed again |
| 27, 29 | A | EARL, PEARL |  | A plays B's removed PEARL |
| 31 | A | stuck |  | Game ends: **A 19, B 11** |

After move 7, and the final board:

```
T . . . . .        T . S . . .
O . . . . s        O . T r e s
D R I N K k        D R I N K k
A C R E . u        A C R E S u
Y p e A r l        Y P E A R l
. t o t a l        . t o t a l
```

**What it shows**

- **The drift is gone.** Ending on the chain letter and crossing let chains turn back up and left. No player was trapped by an edge.
- **A stuck player hands over the game.** B froze at move 12, 5 cells behind, and sat out A's last 9 turns. Here A was already winning, but in a close game the frozen player can do nothing while the other keeps scoring.
- **Timeouts can loop.** A timeout removes TIRE, which makes STIR the last word again, and from STIR the easiest move is TIRE again. Nothing stops the cycle.
- **Crossing your own word is a cheap +1.** ACRE → ACRES scored one cell for no real effort.
