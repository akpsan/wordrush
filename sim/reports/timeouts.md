# timeouts

Each turn with a legal move is replaced by a timeout with the given probability. Checks for loops, runaway games and how often the zero-words loss decides a game. Bots don't time out for real, so this says nothing about whether 20 seconds is fair.

Run `20261103-122202` · 2500 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 p=0.05 | balanced | 500 | 8.3 ± 0.4 | 78% | 62% (57–66) | 38% (34–42) | 0% | 6.1 ± 0.4 | 21% | 0.4 ± 0.1 | 13% | 1.9 | 400 | 13% | 0.9 | 22% |
| V7 p=0.15 | balanced | 500 | 6.2 ± 0.5 | 53% | 56% (52–60) | 43% (39–47) | 1% | 7.2 ± 0.6 | 48% | 0.4 ± 0.1 | 9% | 1.3 | 423 | 12% | 2.2 | 50% |
| V7 − zero-words loss p=0.15 | balanced | 500 | 12.0 ± 0.1 | 98% | 56% (52–61) | 43% (39–47) | 1% | 11.1 ± 0.8 | 0% | 0.9 ± 0.1 | 20% | 3.0 | 395 | 13% | 4.3 | 0% |
| V7 − timeout ban p=0.15 | balanced | 500 | 5.9 ± 0.5 | 50% | 50% (46–55) | 49% (45–54) | 1% | 6.8 ± 0.6 | 50% | 0.4 ± 0.1 | 9% | 1.3 | 401 | 13% | 2.1 | 53% |
| V5 p=0.15 | balanced | 500 | 13.3 ± 0.2 | 92% | 59% (54–63) | 41% (37–45) | 0% | 9.3 ± 0.6 | 0% | 0.9 ± 0.1 | 19% | 6.1 | 258 | 23% | 4.6 | 0% |

End reasons:

- V7 p=0.05 / balanced: both_passed 282, zero_words 111, full 107
- V7 p=0.15 / balanced: zero_words 251, both_passed 178, full 71
- V7 − zero-words loss p=0.15 / balanced: both_passed 361, full 139
- V7 − timeout ban p=0.15 / balanced: zero_words 264, both_passed 165, full 71
- V5 p=0.15 / balanced: both_passed 479, full 21

