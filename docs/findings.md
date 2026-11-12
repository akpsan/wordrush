# Simulation findings: batch 1

Nov 3, 2026 · 51,900 simulated games · detailed tables in [sim/reports/](../sim/reports/)

## Summary

- **The original rules (V1) are broken, as the dry runs suggested, only worse.** The second player walls off the first on move 2, and 89% of games are draws after one word each.
- **The v2 fixes work for game length.** Under V7 (Rules v2 plus the zero-words loss), each player places about 10 words and the board ends 98% full.
- **V7 is unfair to the second player.** A wins 60–77% of games, depending on the bot. Even two random players show it, so the cause is the rules, not skill.
- **Limiting A's first word to 4 letters is the best fairness fix found.** It brings A's win rate to 53% against 42%, and gives the same result at every skill level. Bonus cells for B also work, but the right amount depends on skill.
- **Revive carries half of every game.** Every player gets cornered by about word 5–6, and from then on the game runs on revive. This is what makes V7 feel like Blokus.
- **Crossing adds little once revive exists.** Removing it changes almost nothing (9.5 words each instead of 10, 99% filled).
- **The zero-words loss decides many games when timeouts happen early.** At a 5% timeout rate, it ended 22% of games, almost all within the first two turns.

## How the simulation works

- **Engine:** the rules as code, with every rule as a switch. It replays all three dry runs from [rules.md](rules.md) exactly, with the same boards and scores.
- **Bots, weakest to strongest:**
  - random
  - greedy (most new cells now)
  - defensive (keeps its own options open)
  - aggressive (limits the opponent's options)
  - balanced (both)
  - search (balanced plus the opponent's best reply)
- **Words:** 2,472 everyday 3–5 letter words, plus a full 13,511-word list for comparison.
- **No timer model.** Bots find words instantly, so timeouts appear only in a separate experiment that injects them at random.
- **Statistics:** 400–1,000 games per setting. Win rates are shown with 95% ranges, so a small difference between two settings may be noise.

## 1. The rule ladder

Each version adds one change to the one before. Results use the balanced and search bots.

| Version | Change | Words per player | Board filled | A wins / B wins (search bot) |
| --- | --- | --- | --- | --- |
| V1 | Rules as written | 1.5 | 20% | 6 / 13, 81% draws |
| V2 | Stuck player passes | 5.0 | 53% | 4 / 95 |
| V3 | Start or end on the chain letter | 6.6 | 69% | 53 / 41 |
| V4 | Corner starts | 6.5 | 70% | 58 / 31 |
| V5 | Crossing on matching letters | 10.9 | 91% | 64 / 34 |
| V6 | Revive and the timeout word ban | 11.6 | 100% | 61 / 32 |
| V7 | 2-new-cell minimum and the zero-words loss | 10.0 | 98% | 60 / 32 |

## 2. What each rule does on its own

Each row removes one rule from V7 and keeps the rest (balanced bot).

| Removed from V7 | Effect |
| --- | --- |
| Start-or-end | **The game breaks.** B's first word ends in the bottom-right corner and can never grow again. A wins 100% of games. Corner starts depend on start-or-end. |
| Corner starts | A's edge drops from 77% to 63%. |
| Crossing | Almost no change. Revive already prevents dead ends. |
| 2-cell minimum | Slightly longer games (11.6 words each), and balance is unchanged. |
| Revive, with a stuck player passing | 8.7 words each, 86% filled, and A's edge drops to 64%. Getting cornered becomes permanent. |
| Revive, with being stuck ending the game | 7.1 words each, 75% filled, and A wins 87%. |

## 3. Fairness

### How big the first-player edge is

| Bots (both sides) | A wins | B wins |
| --- | --- | --- |
| Random | 62% | 34% |
| Greedy | 70% | 24% |
| Defensive | 63% | 32% |
| Aggressive | 70% | 28% |
| Balanced | 77% | 20% |
| Search | 60% | 32% |

### Where it comes from

1. **The end-game race.** Both players run out of space at about the same time, and A picks first in every round. The player who places more words wins 90–99% of games.
2. **The opening.** A's first word sets its first head and how much space it claims before the two players meet. Section 3's fixes show this matters as much as the race.

The edge does not come from being cornered first: who gets cornered first is 50/50 with the search bot.

### Fixes tested

| Fix | Balanced bot: A / B | Search bot: A / B |
| --- | --- | --- |
| None (V7) | 77 / 20 | 60 / 32 |
| B gets +1 cell | 67 / 30 | 55 / 42 |
| B gets +2 cells | 56 / 40 | 44 / 52 |
| B gets +3 cells | 51 / 46 | 39 / 59 |
| **A's first word at most 4 letters** | **53 / 42** | **53 / 42** |
| A's first word at most 3 letters | 37 / 61 | 39 / 57 |

- **Bonus cells (komi)** work, but the fair amount depends on skill: about +1.5 for the search bot and about +3.5 for the balanced bot. Any fixed bonus will be unfair at some skill level.
- **A 4-letter first word** gives the same result at both skill levels, which makes it the more reliable fix. The 3-letter limit overshoots in B's favor.
- **Likely best:** a 4-letter first word plus a half-cell bonus for B (+0.5 or +1.5) to close the remaining gap, with no draws. Not tested yet.

### Other fairness factors

- **Board size:** smaller boards are fairer. A wins 57% on 6×6, 66% on 7×7, and 75% on both 8×8 and 10×10.
- **Skill beats seat.** A stronger bot beats a weaker one from either side. For example, the search bot beats greedy 66% to 28%.
- **Games are close.** The typical winning margin is about 4 cells, and the player behind at halftime goes on to win 20–43% of games.

## 4. Skill and strategy

- **Skill matters.** Every bot beats random 88–94% of the time.
- **Attacking beats defending.** The aggressive bot beats the defensive one 68% to 30%, and the defensive bot loses even to greedy (36% to 60%). Limiting your opponent's options matters more than protecting your own, which fits the Tron idea.
- **The strongest bots are close.** The search bot beats balanced 54% to 42%. Aggressive edges both (52–53%), which is within noise.

## 5. Board size (V7, balanced bot)

| Board | Words per player | Board filled | A wins / B wins |
| --- | --- | --- | --- |
| 6×6 | 5.2 | 96% | 57 / 41 |
| 7×7 | 7.4 | 98% | 66 / 29 |
| 8×8 | 10.0 | 98% | 75 / 20 |
| 10×10 | 14.8 | 98% | 75 / 23 |

Game length grows with the board's area. 6×6 is a reasonable quick mode and the fairest size tested.

## 6. Dictionary

| Rules | Word list | Words per player | Legal moves per turn | A wins / B wins |
| --- | --- | --- | --- | --- |
| V7 | Everyday (2,472) | 10.0 | 398 | 73 / 22 |
| V7 | Full (13,511) | 10.1 | 1,783 | 73 / 21 |
| V4 | Everyday | 6.5 | 435 | 75 / 20 |
| V4 | Full | 6.7 | 2,040 | 59 / 35 |

Under V7, a bigger word list gives players four times as many options but changes neither game length nor fairness. Board space, not vocabulary, is the limit. It matters only under stricter rules like V4.

About 30% of all words played end in S, mostly plurals, because S gives the most options on the next turn. Under V7, no ending is a real trap: next-turn stuck rates range from 5% (S) to 18% (B).

## 7. Timeouts

Timeouts were injected at random to test the rules' mechanics. This says nothing about whether 20 seconds is fair.

| Setting | Words per player | Games ended by the zero-words loss |
| --- | --- | --- |
| V7, 5% of turns time out | 8.3 | 22% |
| V7, 15% of turns time out | 6.2 | 50% |
| V7 without the zero-words loss, 15% | 12.0 | 0% |
| V7 without the timeout ban, 15% | 5.9 | 53% |
| V5 (no ban, no zero-words loss), 15% | 13.3 | 0% |

- **No loops or runaway games** in any setting.
- **The zero-words loss is harsh when timeouts can happen early.** A timeout on your first or second turn leaves you with no words and ends the game. At a 5% timeout rate, that's about 1 game in 5. How often real players time out early is a question for playtests.

## 8. Cornering and revive

- Under V7, **every game reaches a point where a player's latest word is sealed in**, at about word 5–6 of 10. From then on, the game runs on revive.
- Being truly stuck (no move even with revive) happens only at the very end, in 83% of games.
- Without revive, the first stuck player is usually followed by only about one more word from the opponent. Being frozen out is short, not the 9 turns from dry run 3.

## Corrections to earlier claims

- **rules.md said corner starts "fix the wall" and halve the score gap.** They do fix the wall, but they also create most of the first-player edge.
- **rules.md said the first player wins about 55% against 40% under v2.** The measured figure is 60–77% against 20–32%.
- **During the analysis I first said that limiting A's first word "probably helps less".** That was wrong; it is the most reliable fix found.
- **I first said the first-player edge shrinks as skill improves.** It doesn't: it is 60–77% at every skill level.

## Decisions made (Nov 3)

In order:
1. Revive, crossing and the timer were removed (so no timeout rules). The board stays 8×8. This left ladder version V4, called Rules v3.
2. A's first word was limited to 4 letters, and B got +0.5.
3. **A cornered player loses.** B's +0.5 was dropped because it never mattered.
4. Players type their own words on an on-screen keyboard. There are no suggestions and only one mode.

The result is Rules v4 in [rules.md](rules.md).

## Word length under Rules v3

From [word_length.md](../sim/reports/word_length.md): 1,000 games per row.

| Rule | Words per player | Board filled | A wins / B wins (balanced) | A wins / B wins (search) |
| --- | --- | --- | --- | --- |
| Maximum 5 letters (v3 as written) | 6.5–6.8 | 69–73% | 75 / 21 | 62 / 28 |
| Maximum 4 letters for everyone | 7.0–7.3 | 63–66% | 87 / 11 | 81 / 14 |
| Maximum 4 letters for A's first word only | 6.4–6.8 | 66–70% | 51 / 44 | 56 / 42 |

- **A 4-letter maximum for everyone makes the first-player edge worse.** A uniform rule keeps the game symmetric, so it can't offset an advantage that comes from moving first.
- **Limiting A's first word works again** under the v3 rules.
- **Bonus needed for an even split**, computed from each game's final cell difference:
  - v3 as written: about +1.5 for the search bot, more than +3.5 for the balanced bot.
  - With A's first word limited to 4 letters: +0.5 for the balanced bot (51/49), +1.5 for the search bot (50/50).

  The first-word limit makes the bonus much less dependent on skill.

## Cornered loses

From [cornered.md](../sim/reports/cornered.md): 1,000 games per row. Under "cornered loses", the first player with no legal move loses.

| Rules | Bot | Words per player | Board filled | A wins / B wins |
| --- | --- | --- | --- | --- |
| v3 (stuck passes) | balanced | 6.4 | 66% | 51 / 49 |
| v3 (stuck passes) | aggressive | 6.6 | 66% | 66 / 34 |
| v3 (stuck passes) | search | 6.8 | 70% | 58 / 42 |
| **v3 + cornered loses** | balanced | 6.2 | 62% | **50 / 50** |
| **v3 + cornered loses** | aggressive | 6.7 | 66% | **57 / 43** |
| **v3 + cornered loses** | search | 6.5 | 65% | **48 / 52** |
| Cornered loses, no first-player fix | balanced | 6.1 | 63% | 44 / 56 |
| Cornered loses, no first-player fix | aggressive | 6.4 | 65% | 44 / 56 |
| Cornered loses, no first-player fix | search | 6.5 | 66% | 46 / 54 |

- **"Cornered loses" with A's 4-letter first word is the fairest setup tested.** It ranges from 48% to 57% for A, depending on the bot.
- **Without the fix, B gets a slight edge (54–56%).** When both players are boxed in during the same round, the player whose turn comes next, often A, loses.
- **Unexpectedly, the 4-letter first word helps A here.** It moves A from 44–46% to 48–57%. The likely cause is that a shorter first word keeps A's opening head away from B's side, but this is a hypothesis.
- **B's +0.5 never mattered.** All 9,000 games ended by cornering, and none filled the board.
- **Skill matters more.** Balanced beats greedy 78% to 22%, against 69% to 31% when stuck players pass. It beats random 84% of the time. The search bot is no better than balanced under this rule (47% to 53%).

## Hex mode

From [hex.md](../sim/reports/hex.md): 300 games per row, Rules v4 with the board shape changed. On a hexagon, words run across, down-right or down-left.

| Variant | Cells | Words per player (balanced) | A wins: balanced mirror | A wins: aggressive mirror | Random beats balanced |
| --- | --- | --- | --- | --- | --- |
| Square 8 × 8 (Rules v4) | 64 | 6.0 | 50% | 55% | 23% |
| Hex, radius 4 | 61 | 5.5 | **85%** | 49% | 10% |
| Hex, radius 4, A's first word 3 letters | 61 | 6.2 | 48% | **29%** | 8% |
| Hex, radius 5 | 91 | 8.2 | 48% | **31%** | 21% |
| **Hex, radius 5, A's first word 3 letters (adopted)** | 91 | 8.4 | **52%** | **44%** | 17% |
| Hex, radius 5, no first-word limit | 91 | 7.2 | 66% | 67% | 14% |

- **Radius 5 with a 3-letter first word is the only variant fair for both bot styles.** It was adopted as hex mode (`HEX`).
- **Small hexagons swing hard on the opening.** The third direction gives every player more ways out, so who closes off whom early decides more games.
- **Games run longer:** about 8 words per player instead of 6, still a few minutes.
- **Skill still matters, and weaker players still win some games:** random play beats the balanced bot 17% of the time (23% on the square).
- **The lookahead bot was left out** of the full run because it is slow on bigger boards. In a 40-game trial on radius 4 it split about evenly.
- The app's engine replays 160 simulated hex games with identical decisions (`sim/scripts/export_hex_conformance.py`).

## Still to test

- **A rule-agnostic MCTS bot,** to confirm the "cornered loses" results with a stronger player that wasn't hand-tuned for the rule.
- **A bot with a limited vocabulary,** closer to how real players type words.

Auto-dissolve, Snake mode and the other revive alternatives were set aside on Nov 3, after "cornered loses" made them unnecessary.

## Caveats

- **These are bots.** The results describe tireless play that sees every legal move. Real players type their own words and know fewer of them, which may change the results.
- **One word list for most results.** The full list barely changes V7.
- **The bots were adapted by hand for "cornered loses".** They know being cornered is a loss and weight mobility over cells. A rule-agnostic MCTS bot would confirm the results without that tuning.
