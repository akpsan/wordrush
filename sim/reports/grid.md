# grid

V7 on 6×6, 7×7, 8×8 and 10×10.

Run `20261103-115540` · 4000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 6×6 | balanced | 1000 | 5.2 ± 0.0 | 96% | 57% (54–60) | 41% (38–44) | 2% | 5.2 ± 0.2 | 0% | 0.1 ± 0.0 | 8% | 3.0 | 261 | 31% | 0.0 | 0% |
| V7 7×7 | balanced | 1000 | 7.4 ± 0.0 | 98% | 66% (62–68) | 29% (26–32) | 5% | 3.2 ± 0.1 | 0% | 0.7 ± 0.1 | 26% | 2.2 | 333 | 17% | 0.0 | 0% |
| V7 8×8 | balanced | 1000 | 10.0 ± 0.0 | 98% | 75% (72–78) | 20% (18–23) | 4% | 4.6 ± 0.2 | 0% | 0.4 ± 0.0 | 20% | 2.2 | 402 | 13% | 0.0 | 0% |
| V7 10×10 | balanced | 1000 | 14.8 ± 0.0 | 98% | 75% (72–77) | 23% (21–26) | 2% | 5.2 ± 0.2 | 0% | 0.8 ± 0.1 | 22% | 2.8 | 688 | 11% | 0.0 | 0% |

End reasons:

- V7 6×6 / balanced: both_passed 820, full 180
- V7 7×7 / balanced: both_passed 781, full 219
- V7 8×8 / balanced: both_passed 702, full 298
- V7 10×10 / balanced: both_passed 905, full 95

