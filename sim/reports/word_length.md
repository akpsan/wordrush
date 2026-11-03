# word_length

Rules v3 (V8: no revive, no crossing, no timer). Compares the 5-letter maximum, a 4-letter maximum for every word by both players, and a 4-letter limit on A's first word only.

Run `20261103-123614` · 6000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V8 max 5 | balanced | 1000 | 6.5 ± 0.0 | 69% | 75% (72–78) | 21% (18–24) | 4% | 5.2 ± 0.2 | 0% | 0.2 ± 0.0 | 11% | 2.9 | 432 | 21% | 0.0 | 0% |
| V8 max 5 | lookahead | 1000 | 6.8 ± 0.1 | 73% | 62% (58–64) | 28% (26–31) | 10% | 4.0 ± 0.2 | 0% | 0.2 ± 0.0 | 17% | 2.9 | 441 | 20% | 0.0 | 0% |
| V8 max 4 for all | balanced | 1000 | 7.0 ± 0.1 | 63% | 87% (84–89) | 11% (10–14) | 2% | 4.4 ± 0.2 | 0% | 0.0 ± 0.0 | 10% | 2.8 | 300 | 19% | 0.0 | 0% |
| V8 max 4 for all | lookahead | 1000 | 7.3 ± 0.1 | 66% | 81% (78–83) | 14% (12–16) | 5% | 4.5 ± 0.2 | 0% | 0.1 ± 0.0 | 7% | 3.0 | 292 | 19% | 0.0 | 0% |
| V8 A first word ≤4 | balanced | 1000 | 6.4 ± 0.1 | 66% | 51% (48–54) | 44% (41–47) | 5% | 4.1 ± 0.2 | 0% | 0.6 ± 0.0 | 27% | 3.0 | 432 | 22% | 0.0 | 0% |
| V8 A first word ≤4 | lookahead | 1000 | 6.8 ± 0.1 | 70% | 56% (53–59) | 42% (39–45) | 2% | 5.0 ± 0.2 | 0% | 0.7 ± 0.0 | 19% | 3.2 | 433 | 22% | 0.0 | 0% |

End reasons:

- V8 max 5 / balanced: both_passed 1000
- V8 max 5 / lookahead: both_passed 1000
- V8 max 4 for all / balanced: both_passed 1000
- V8 max 4 for all / lookahead: both_passed 1000
- V8 A first word ≤4 / balanced: both_passed 1000
- V8 A first word ≤4 / lookahead: both_passed 1000

