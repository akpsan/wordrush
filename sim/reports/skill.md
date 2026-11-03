# skill

V7, round robin between all bots, plus each bot against itself. Checks that skill wins, which styles dominate, and whether first-player advantage depends on skill.

Run `20261103-105815` · 8400 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 | random | 400 | 10.9 ± 0.1 | 96% | 62% (57–67) | 34% (30–39) | 3% | 4.2 ± 0.3 | 0% | 0.8 ± 0.1 | 21% | 2.5 | 212 | 16% | 0.0 | 0% |
| V7 | greedy | 400 | 9.2 ± 0.0 | 97% | 70% (65–74) | 24% (20–28) | 6% | 3.5 ± 0.3 | 0% | 0.5 ± 0.1 | 21% | 2.1 | 223 | 15% | 0.0 | 0% |
| V7 | defensive | 400 | 9.7 ± 0.1 | 98% | 63% (58–68) | 32% (27–36) | 5% | 3.7 ± 0.3 | 0% | 0.5 ± 0.1 | 27% | 2.0 | 504 | 11% | 0.0 | 0% |
| V7 | aggressive | 400 | 10.1 ± 0.1 | 98% | 70% (65–74) | 28% (24–32) | 2% | 4.9 ± 0.4 | 0% | 0.7 ± 0.1 | 24% | 2.6 | 188 | 19% | 0.0 | 0% |
| V7 | balanced | 400 | 10.0 ± 0.1 | 98% | 76% (72–80) | 22% (18–26) | 2% | 4.5 ± 0.3 | 0% | 0.5 ± 0.1 | 21% | 2.1 | 396 | 13% | 0.0 | 0% |
| V7 | lookahead | 400 | 9.7 ± 0.1 | 98% | 62% (57–67) | 30% (25–34) | 8% | 3.9 ± 0.3 | 0% | 0.5 ± 0.1 | 27% | 2.2 | 434 | 13% | 0.0 | 0% |

End reasons:

- V7 / random: both_passed 374, full 26
- V7 / greedy: both_passed 341, full 59
- V7 / defensive: both_passed 283, full 117
- V7 / aggressive: both_passed 329, full 71
- V7 / balanced: both_passed 255, full 145
- V7 / lookahead: both_passed 295, full 105

## Bot against bot (paired: each seed played from both sides)

| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |
| --- | --- | --- | --- | --- | --- | --- |
| V7 | aggressive vs balanced | 400 | 52% (47–57) | 45% (40–50) | 70% | 10.0 |
| V7 | aggressive vs lookahead | 400 | 53% (48–58) | 45% (40–50) | 72% | 9.9 |
| V7 | balanced vs lookahead | 400 | 42% (37–47) | 54% (49–59) | 68% | 9.8 |
| V7 | defensive vs aggressive | 400 | 30% (25–34) | 68% (63–72) | 69% | 9.9 |
| V7 | defensive vs balanced | 400 | 33% (28–37) | 61% (56–66) | 70% | 9.9 |
| V7 | defensive vs lookahead | 400 | 27% (23–32) | 67% (62–71) | 62% | 9.7 |
| V7 | greedy vs aggressive | 400 | 39% (34–44) | 57% (52–62) | 67% | 9.8 |
| V7 | greedy vs balanced | 400 | 40% (36–45) | 55% (50–60) | 68% | 9.5 |
| V7 | greedy vs defensive | 400 | 60% (55–65) | 36% (32–41) | 72% | 9.4 |
| V7 | greedy vs lookahead | 400 | 28% (24–33) | 66% (61–70) | 68% | 9.4 |
| V7 | random vs aggressive | 400 | 6% (4–8) | 94% (91–96) | 54% | 10.5 |
| V7 | random vs balanced | 400 | 6% (4–9) | 93% (90–95) | 55% | 10.4 |
| V7 | random vs defensive | 400 | 8% (6–11) | 90% (87–93) | 56% | 10.3 |
| V7 | random vs greedy | 400 | 11% (8–14) | 88% (84–91) | 56% | 10.0 |
| V7 | random vs lookahead | 400 | 5% (3–8) | 94% (91–96) | 54% | 10.4 |

