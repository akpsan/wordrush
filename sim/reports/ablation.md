# ablation

V7 baseline, then V7 with exactly one change undone. Shows what each change is worth on its own.

Run `20261103-104600` · 7000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 | balanced | 1000 | 10.0 ± 0.0 | 98% | 77% (74–79) | 20% (18–23) | 3% | 4.6 ± 0.2 | 0% | 0.4 ± 0.0 | 20% | 2.2 | 398 | 13% | 0.0 | 0% |
| V7 − start-or-end | balanced | 1000 | 8.6 ± 0.0 | 98% | 100% (100–100) | 0% (0–0) | 0% | 52.6 ± 0.1 | 0% | 0.0 ± 0.0 | 0% | 16.0 | 282 | 51% | 0.0 | 0% |
| V7 − corner starts | balanced | 1000 | 10.0 ± 0.0 | 97% | 63% (60–66) | 33% (30–36) | 4% | 5.1 ± 0.2 | 0% | 0.7 ± 0.0 | 27% | 2.6 | 324 | 15% | 0.0 | 0% |
| V7 − crossing | balanced | 1000 | 9.5 ± 0.0 | 99% | 79% (76–81) | 19% (17–22) | 2% | 6.9 ± 0.3 | 0% | 1.1 ± 0.1 | 21% | 2.3 | 491 | 12% | 0.0 | 0% |
| V7 − 2-cell minimum | balanced | 1000 | 11.6 ± 0.1 | 100% | 75% (72–77) | 20% (18–23) | 5% | 3.7 ± 0.2 | 0% | 0.5 ± 0.0 | 18% | 1.1 | 340 | 11% | 0.0 | 0% |
| V7 − revive (pass only) | balanced | 1000 | 8.7 ± 0.0 | 86% | 64% (61–67) | 34% (31–37) | 2% | 6.7 ± 0.3 | 0% | 0.4 ± 0.0 | 27% | 4.0 | 328 | 23% | 0.0 | 0% |
| V7 − revive (stuck ends game) | balanced | 1000 | 7.1 ± 0.1 | 75% | 87% (85–89) | 7% (6–9) | 5% | 2.4 ± 0.1 | 0% | 0.1 ± 0.0 | 7% | 1.0 | 462 | 9% | 0.0 | 0% |

End reasons:

- V7 / balanced: both_passed 658, full 342
- V7 − start-or-end / balanced: both_passed 876, full 124
- V7 − corner starts / balanced: both_passed 746, full 254
- V7 − crossing / balanced: full 543, both_passed 457
- V7 − 2-cell minimum / balanced: full 796, both_passed 204
- V7 − revive (pass only) / balanced: both_passed 1000
- V7 − revive (stuck ends game) / balanced: stuck 1000

