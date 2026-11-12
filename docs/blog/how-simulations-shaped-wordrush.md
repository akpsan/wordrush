# How 87,300 simulated games shaped WordRush's rules

Nov 12, 2026 · [Play WordRush](https://wordrush.akpsan.workers.dev) · [Source on GitHub](https://github.com/akpsan/wordrush)

## The game, and the problem

WordRush is a two-player word game on a shared board. Each player grows a chain of words from their own last word, every letter already on the board is a wall, and the first player who can't place a word loses. Think Tron light cycles crossed with Shiritori.

The first draft of the rules read well: a 20-second timer, words chaining from the last letter, a first word placed anywhere. Two dry runs by hand ([rules.md](../rules.md#dry-run-2-the-wall)) suggested the second player could wall off the first on move 2, but two games prove nothing. Rules that sound fair on paper can be broken in play, and I wanted to know which of mine were before building an app on them.

## The method

I built a simulator in Python with no dependencies ([pyproject.toml](../../sim/pyproject.toml)). Every rule is a flag on a config ([rules.py](../../sim/src/wordrush_sim/engine/rules.py)), so a variant is a setting, not a code branch. Six bots play it, weakest to strongest: random, greedy (most new cells now), defensive (keeps its own options open), aggressive (limits the opponent's), balanced (both), and a two-ply lookahead I'll call the search bot.

The statistics follow fixed habits from the [simulation approach decision](../decisions/0001-simulation-approach.md): 1,000 games per setting where affordable, 95% Wilson intervals on win rates, one rule changed at a time against a baseline, and paired games when two different bots meet, so each seed is played twice with sides swapped and the first-move edge cancels out of skill comparisons. Most runs use an everyday list of 2,472 three-to-five-letter words; the full ENABLE list has 13,511. Before this I had tested with 120–150 games per variant and a modelled human timer, giving intervals of about ±9 points, which proved noisy enough to point the wrong way.

Claude Code built the simulator and proposed the hypotheses after reading replays and reports. Every hypothesis was then tested in code; the model never did the counting and never judged a result by eye ([sim/CLAUDE.md](../../sim/CLAUDE.md)). Across eleven experiments the simulator played 87,300 games.[^total]

| Experiment | Games | Question | Result |
| --- | --- | --- | --- |
| [ladder](../../sim/reports/ladder.md) | 14,000 | What does each rule version do? | V1 is broken; V7 fills the board |
| [ablation](../../sim/reports/ablation.md) | 7,000 | What is each V7 rule worth alone? | Start-or-end essential; crossing adds little |
| [skill](../../sim/reports/skill.md) | 8,400 | Does skill win? Does seat depend on it? | Skill wins; A's edge at every level |
| [first_player](../../sim/reports/first_player.md) | 12,000 | Which fix for A's edge? | 4-letter first word, same at both skills |
| [grid](../../sim/reports/grid.md) | 4,000 | Does board size matter? | Smaller is fairer |
| [dictionary](../../sim/reports/dictionary.md) | 4,000 | Does the word list matter? | Not under V7 |
| [timeouts](../../sim/reports/timeouts.md) | 2,500 | Do timeout rules hold up? | No loops; zero-words loss is harsh |
| [word_length](../../sim/reports/word_length.md) | 6,000 | Does a 4-letter cap for all help? | No, it makes A's edge worse |
| [cornered](../../sim/reports/cornered.md) | 18,000 | Should a cornered player lose? | Yes: 48–57% for A |
| [dictionary_current](../../sim/reports/dictionary_current.md) | 6,000 | Does the full list break Rules v4? | No, A at most 55% |
| [hex](../../sim/reports/hex.md) | 5,400 | Which hexagon is fair? | Radius 5, 3-letter first word |

## The first finding: the rules as written were broken

Under V1, the rules as written, balanced bots place 1.5 words each on average, fill 20% of the board, and draw 89% of games ([ladder.md](../../sim/reports/ladder.md)). The second player's first word parks alongside the first player's and seals every exit, as dry run 2 had hinted, only worse. Most games are over after one word each.

## The rule ladder

Each version adds one change to the one before ([ladder.md](../../sim/reports/ladder.md)). V2 lets a stuck player pass, which hands the game to B: 97% of games between balanced bots. V3 lets a word start *or* end on the chain letter, so chains can turn back instead of drifting into a corner. V4 fixes the first words in opposite corners, which kills the move-2 wall. V5 lets a word cross a matching letter, V6 adds revive (a stuck player chains from any older word) and bans timed-out words, and V7 adds a 2-new-cell minimum and the zero-words loss. Game length climbs from 1.5 words per player under V1 to 10.0 under V7, with the board 98% full.

Then the [ablation](../../sim/reports/ablation.md) removed one rule at a time from V7, and three rules did not earn their place.

- **Revive** carried half of every game. A player's latest word was sealed in at about word 5–6 of 10, and from there the game ran on revive. It felt like Blokus, not Tron ([findings.md](../findings.md#8-cornering-and-revive)).
- **Crossing** added little once revive existed: without it, 9.5 words each instead of 10 and a 99% full board.
- **The timer** needed the zero-words loss to stop a place-remove-place loop, and that loss was harsh. With timeouts injected at random on 5% of turns it ended 22% of games, almost all within the first two turns; at 15%, 50% ([timeouts.md](../../sim/reports/timeouts.md)). The simulator has no timer model, so it could never say whether 20 seconds is fair.

Two rules proved load-bearing. Remove start-or-end and A wins 100% of games, because B's first word dies in its corner. Remove corner starts and A's edge drops from 77% to 63%: corners fix the wall, but they also create most of the first-player edge.

On Nov 3 I removed revive, crossing and the timer, which left V4 and became Rules v3. Without crossing every word adds at least 2 cells, so the 2-cell minimum went too.

## The first-player problem

Under V7, A wins 60–77% of games depending on the bot, and two random bots give A 62% to 34%, so the cause is the rules, not skill ([skill.md](../../sim/reports/skill.md)). Both players run out of space at about the same time, and A picks first in every round. My earlier 150-game runs had put the edge at about 55% to 40%.

The [first_player](../../sim/reports/first_player.md) experiment tried bonus cells for B and a shorter first word for A. Bonus cells work, but the fair amount depends on skill: +2 cells gave A 56 / 40 with balanced bots and 44 / 52 with the search bot, so any fixed bonus is unfair at some level. A 4-letter cap on A's first word gave 53 / 42 with both bots; a 3-letter cap overshot to 37 / 61 and 39 / 57. I had guessed the shorter first word would help less than a bonus. The numbers said otherwise ([findings.md](../findings.md#corrections-to-earlier-claims)).

One fix failed outright. Under Rules v3, a 4-letter maximum for everyone made the edge worse, 87 / 11 and 81 / 14 against 75 / 21 and 62 / 28 with the usual 5 letters ([word_length.md](../../sim/reports/word_length.md)). A symmetric rule can't offset an advantage that comes from moving first. Smaller boards were fairer, 57% for A on 6×6 against 75% on 8×8, at the cost of a shorter game ([grid.md](../../sim/reports/grid.md)).

The second change that worked was "cornered loses": the first player with no legal move loses, instead of passing. With A's 4-letter first word it gave 50 / 50 for balanced bots, 57 / 43 for aggressive and 48 / 52 for the search bot ([cornered.md](../../sim/reports/cornered.md)). Without the first-word fix B edged ahead, 54–56%, because when both players get boxed in during the same round the player whose turn comes next loses. B's +0.5 bonus from Rules v3 was dropped: all 9,000 games ended by cornering, so it never decided one. Two things are weaker than I'd hoped. The aggressive mirror still tilts to A, and why the 4-letter first word helps A under this rule is a hypothesis, not a measurement.

## The dictionary experiment

The app lets players type any word in the playable list, so the rules had to hold with the full list too. Under V7 the full ENABLE list gave 1,783 legal moves per turn instead of 398, yet win rates barely moved, 73 / 21 against 73 / 22 on the everyday list ([dictionary.md](../../sim/reports/dictionary.md)). Board space, not vocabulary, is the limit. Under Rules v4 the picture is similar but not identical: balanced bots go from 50 / 50 on the everyday list to 55 / 45 on the full list, and the search bot from 48 / 52 to 53 / 47 ([dictionary_current.md](../../sim/reports/dictionary_current.md)). A random player beats the balanced bot 17% of the time on one list and 18% on the other, so a bigger vocabulary doesn't blunt skill.

## Hex mode

On Nov 12 the product direction changed to a honeycomb board, and the same method chose its size. Rules v4 on a hexagon adds a third line direction, down-left. The [hex](../../sim/reports/hex.md) run used 300 games per row, with balanced and aggressive mirrors; on the square, A wins 50% and 55%. A radius-4 hexagon (61 cells) gave A 85% between balanced bots. Radius 5 (91 cells) with A's usual 4-letter first word was fair for balanced bots at 48% but not for aggressive ones at 31%, and with no first-word limit A won 66% and 67%. Cutting A's first word to 3 letters on radius 5 gave 52% and 44%, the only variant fair for both styles, and it was adopted.

Small hexagons swing hard on the opening: the third direction gives every player more ways out, so who closes off whom early decides more games. Games run longer, 8.4 words per player against 6.0 on the square, and a random player still beats the balanced bot 17% of the time (23% on the square). The evidence is thinner than for the square: 300 games per row gives wide intervals, the aggressive mirror still favours B, and the search bot was left out because it is slow on bigger boards.

| Rule | Rules v1 (as written) | Today (Rules v4, hex mode) |
| --- | --- | --- |
| Board | 8×8 square | 91-cell hexagon, radius 5 |
| First words | Anywhere | A starts top-left, B ends bottom-right |
| A's first word | Up to 5 letters | At most 4 letters (3 on the hexagon) |
| Chaining | Start on a letter of your last word | Start or end on it |
| Crossing | None | None (added in V5, removed again) |
| Being stuck | Game ends | You lose |
| Timer | 20 seconds, timed-out word removed | None |
| Scoring | Cells, tie-break by timeouts then words | Only if the board fills: more cells, B wins a tie |

## Keeping the simulator honest

The app has its own engine in TypeScript, and two engines are two chances to be wrong. A [conformance test](../../app/src/engine/__tests__/conformance.test.ts) replays 1,350 simulated square games and 160 hex games through the TypeScript engine. Before every move the number of legal moves must match the simulator's, every move must be legal, and each game must end with the same reason and winner. The Python engine in turn replays the three dry runs from the rules document exactly ([test_dry_runs.py](../../sim/tests/test_dry_runs.py)). A rule change means regenerating the fixture, so the engines can't drift apart quietly.

## What I'd do differently, and what is open

I'd skip the timer-model phase and start with the flag-per-rule engine and 1,000-game runs. The early 150-game runs cost time and gave a first-player figure the bigger runs did not support. I'd also run the ablation before adding rules, not after: it would have shown sooner that corner starts create the edge they were meant to fix.

Open work, from [findings.md](../findings.md#still-to-test) and the [product backlog](../product.md):

- **A rule-agnostic MCTS bot.** The bots were adapted by hand for "cornered loses", so they weight mobility over cells. A stronger player not tuned for the rule would confirm or overturn the result; the search bot is only a two-ply lookahead.
- **A limited-vocabulary bot.** Every bot sees all legal moves; real players know fewer words.
- **AI calibration on hex.** The app's three AI levels were calibrated on the square board. Running the calibration script on hex is still on the backlog.
- **Human playtests.** All of this describes tireless bots. Whether the game is fun is not a question the simulator can answer.

[^total]: Games per report header: ladder 14,000 + ablation 7,000 + skill 8,400 + first_player 12,000 + grid 4,000 + dictionary 4,000 + timeouts 2,500 = 51,900 (the batch in findings.md), plus word_length 6,000 + cornered 18,000 + dictionary_current 6,000 + hex 5,400 = 87,300.
