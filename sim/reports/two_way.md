# two_way

Hex mode as adopted (HEX: radius 5, A's first word at most 3 letters, words read left to right or downwards) against the same rules with words also allowed to read backwards (right to left or upwards), which doubles the line directions. Owner playtests found one-way words confusing; this checks what allowing both ways would do to fairness, game length and skill.

Run `20261113-071405` · 1200 games · seed 1 · Python 3.12.3

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hex (one way) | aggressive | 200 | 8.5 ± 0.2 | 65% | 46% (39–53) | 54% (47–61) | 0% | 2.8 ± 0.3 | 0% | 0.4 ± 0.1 | 39% | 1.0 | 999 | 6% | 0.0 | 0% |
| hex (one way) | balanced | 200 | 8.4 ± 0.2 | 64% | 46% (39–53) | 54% (47–61) | 0% | 3.0 ± 0.3 | 0% | 0.5 ± 0.1 | 44% | 1.0 | 1078 | 6% | 0.0 | 0% |
| hex, two-way words | aggressive | 200 | 8.4 ± 0.1 | 64% | 47% (40–54) | 53% (46–60) | 0% | 2.9 ± 0.3 | 0% | 0.4 ± 0.1 | 49% | 1.0 | 1887 | 6% | 0.0 | 0% |
| hex, two-way words | balanced | 200 | 8.3 ± 0.2 | 63% | 48% (42–55) | 52% (45–58) | 0% | 2.7 ± 0.3 | 0% | 0.4 ± 0.1 | 52% | 1.0 | 2024 | 6% | 0.0 | 0% |

End reasons:

- hex (one way) / aggressive: cornered 200
- hex (one way) / balanced: cornered 200
- hex, two-way words / aggressive: cornered 200
- hex, two-way words / balanced: cornered 200

## Bot against bot (paired: each seed played from both sides)

| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |
| --- | --- | --- | --- | --- | --- | --- |
| hex (one way) | random vs balanced | 200 | 14% (9–19) | 86% (81–91) | 48% | 6.6 |
| hex, two-way words | random vs balanced | 200 | 16% (12–22) | 84% (78–88) | 46% | 6.9 |

