# cornered

Rules v3 (stuck player passes) against rules v3 with 'cornered loses'. Also 'cornered loses' without the first-player fix (A's 4-letter first word, B's +0.5), to see whether the fix is still needed. Mirror matches show fairness; mixed matches show whether skill wins.

Run `20261103-130430` · 18000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v3 (stuck passes) | aggressive | 1000 | 6.6 ± 0.1 | 66% | 66% (63–69) | 34% (31–37) | 0% | 6.9 ± 0.3 | 0% | 0.9 ± 0.0 | 17% | 3.7 | 225 | 25% | 0.0 | 0% |
| v3 (stuck passes) | balanced | 1000 | 6.4 ± 0.1 | 66% | 51% (48–54) | 49% (46–52) | 0% | 4.0 ± 0.2 | 0% | 0.5 ± 0.0 | 30% | 2.9 | 430 | 21% | 0.0 | 0% |
| v3 (stuck passes) | lookahead | 1000 | 6.8 ± 0.1 | 70% | 58% (55–61) | 42% (39–45) | 0% | 4.7 ± 0.2 | 0% | 0.7 ± 0.0 | 22% | 3.1 | 432 | 21% | 0.0 | 0% |
| v3 + cornered loses | aggressive | 1000 | 6.7 ± 0.1 | 66% | 57% (54–60) | 43% (40–46) | 0% | 2.3 ± 0.1 | 0% | 0.5 ± 0.0 | 28% | 1.0 | 516 | 8% | 0.0 | 0% |
| v3 + cornered loses | balanced | 1000 | 6.2 ± 0.1 | 62% | 50% (47–53) | 50% (47–53) | 0% | 1.9 ± 0.1 | 0% | 0.5 ± 0.0 | 27% | 1.0 | 555 | 9% | 0.0 | 0% |
| v3 + cornered loses | lookahead | 1000 | 6.5 ± 0.1 | 65% | 48% (44–51) | 52% (49–56) | 0% | 2.2 ± 0.1 | 0% | 0.6 ± 0.0 | 32% | 1.0 | 561 | 8% | 0.0 | 0% |
| cornered loses, no first-player fix | aggressive | 1000 | 6.4 ± 0.1 | 65% | 44% (41–47) | 56% (53–59) | 0% | 2.7 ± 0.1 | 0% | 0.3 ± 0.0 | 37% | 1.0 | 526 | 9% | 0.0 | 0% |
| cornered loses, no first-player fix | balanced | 1000 | 6.1 ± 0.1 | 63% | 44% (41–47) | 56% (53–59) | 0% | 2.6 ± 0.1 | 0% | 0.3 ± 0.0 | 36% | 1.0 | 567 | 9% | 0.0 | 0% |
| cornered loses, no first-player fix | lookahead | 1000 | 6.5 ± 0.1 | 66% | 46% (43–49) | 54% (51–57) | 0% | 2.8 ± 0.1 | 0% | 0.3 ± 0.0 | 32% | 1.0 | 553 | 8% | 0.0 | 0% |

End reasons:

- v3 (stuck passes) / aggressive: both_passed 1000
- v3 (stuck passes) / balanced: both_passed 1000
- v3 (stuck passes) / lookahead: both_passed 1000
- v3 + cornered loses / aggressive: cornered 1000
- v3 + cornered loses / balanced: cornered 1000
- v3 + cornered loses / lookahead: cornered 1000
- cornered loses, no first-player fix / aggressive: cornered 1000
- cornered loses, no first-player fix / balanced: cornered 1000
- cornered loses, no first-player fix / lookahead: cornered 1000

## Bot against bot (paired: each seed played from both sides)

| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |
| --- | --- | --- | --- | --- | --- | --- |
| v3 (stuck passes) | balanced vs lookahead | 1000 | 55% (51–58) | 46% (42–49) | 57% | 6.5 |
| v3 (stuck passes) | greedy vs balanced | 1000 | 31% (28–34) | 69% (66–72) | 49% | 6.5 |
| v3 (stuck passes) | random vs balanced | 1000 | 12% (10–14) | 88% (86–90) | 50% | 6.8 |
| v3 + cornered loses | balanced vs lookahead | 1000 | 53% (50–56) | 47% (44–50) | 46% | 6.3 |
| v3 + cornered loses | greedy vs balanced | 1000 | 22% (20–25) | 78% (75–80) | 52% | 5.6 |
| v3 + cornered loses | random vs balanced | 1000 | 16% (14–19) | 84% (81–86) | 52% | 5.5 |
| cornered loses, no first-player fix | balanced vs lookahead | 1000 | 43% (40–46) | 57% (54–60) | 46% | 6.2 |
| cornered loses, no first-player fix | greedy vs balanced | 1000 | 36% (33–39) | 64% (61–67) | 52% | 5.8 |
| cornered loses, no first-player fix | random vs balanced | 1000 | 15% (13–18) | 85% (82–87) | 51% | 5.5 |

