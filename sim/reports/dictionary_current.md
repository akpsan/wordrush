# dictionary_current

Rules v4 with the everyday list (2,472 words) and the full ENABLE list (13,511 words).

Run `20261103-202656` · 6000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v4 everyday | balanced | 1000 | 6.1 ± 0.1 | 62% | 50% (47–53) | 50% (47–53) | 0% | 2.0 ± 0.1 | 0% | 0.5 ± 0.0 | 28% | 1.0 | 555 | 9% | 0.0 | 0% |
| v4 everyday | lookahead | 1000 | 6.6 ± 0.1 | 66% | 48% (45–51) | 52% (49–55) | 0% | 2.2 ± 0.1 | 0% | 0.6 ± 0.0 | 34% | 1.0 | 561 | 8% | 0.0 | 0% |
| v4 full ENABLE | balanced | 1000 | 6.0 ± 0.1 | 61% | 55% (52–58) | 45% (42–48) | 0% | 2.1 ± 0.1 | 0% | 0.6 ± 0.0 | 32% | 1.0 | 2839 | 9% | 0.0 | 0% |
| v4 full ENABLE | lookahead | 1000 | 6.5 ± 0.1 | 66% | 53% (50–56) | 47% (44–50) | 0% | 2.3 ± 0.1 | 0% | 0.6 ± 0.0 | 36% | 1.0 | 2910 | 8% | 0.0 | 0% |

End reasons:

- v4 everyday / balanced: cornered 1000
- v4 everyday / lookahead: cornered 1000
- v4 full ENABLE / balanced: cornered 1000
- v4 full ENABLE / lookahead: cornered 1000

## Bot against bot (paired: each seed played from both sides)

| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |
| --- | --- | --- | --- | --- | --- | --- |
| v4 everyday | random vs balanced | 1000 | 17% (15–20) | 83% (80–85) | 52% | 5.5 |
| v4 full ENABLE | random vs balanced | 1000 | 18% (16–21) | 82% (79–84) | 53% | 5.5 |

