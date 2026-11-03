# first_player

V7 with candidate fixes for A's first-move edge: bonus cells for B, or a shorter first word for A.

Run `20261103-111454` · 12000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 | balanced | 1000 | 10.0 ± 0.0 | 98% | 77% (74–79) | 20% (18–23) | 3% | 4.6 ± 0.2 | 0% | 0.4 ± 0.0 | 20% | 2.2 | 398 | 13% | 0.0 | 0% |
| V7 | lookahead | 1000 | 9.7 ± 0.0 | 98% | 60% (57–63) | 32% (29–35) | 8% | 3.8 ± 0.2 | 0% | 0.5 ± 0.0 | 29% | 2.2 | 435 | 12% | 0.0 | 0% |
| V7 + B +1 | balanced | 1000 | 10.0 ± 0.0 | 98% | 67% (64–70) | 30% (27–33) | 3% | 4.1 ± 0.2 | 0% | 0.4 ± 0.0 | 26% | 2.3 | 394 | 13% | 0.0 | 0% |
| V7 + B +1 | lookahead | 1000 | 9.7 ± 0.0 | 98% | 55% (52–58) | 42% (39–45) | 3% | 3.7 ± 0.2 | 0% | 0.6 ± 0.0 | 35% | 2.2 | 434 | 12% | 0.0 | 0% |
| V7 + B +2 | balanced | 1000 | 10.0 ± 0.0 | 98% | 56% (53–59) | 40% (37–43) | 4% | 3.8 ± 0.2 | 0% | 0.5 ± 0.0 | 33% | 2.2 | 403 | 13% | 0.0 | 0% |
| V7 + B +2 | lookahead | 1000 | 9.7 ± 0.0 | 98% | 44% (41–47) | 52% (49–55) | 4% | 3.5 ± 0.2 | 0% | 0.6 ± 0.0 | 39% | 2.2 | 436 | 12% | 0.0 | 0% |
| V7 + B +3 | balanced | 1000 | 9.9 ± 0.0 | 98% | 51% (48–54) | 46% (43–49) | 3% | 3.5 ± 0.2 | 0% | 0.4 ± 0.0 | 40% | 2.2 | 403 | 13% | 0.0 | 0% |
| V7 + B +3 | lookahead | 1000 | 9.7 ± 0.0 | 98% | 39% (36–42) | 59% (56–62) | 2% | 3.7 ± 0.2 | 0% | 0.6 ± 0.0 | 43% | 2.2 | 434 | 12% | 0.0 | 0% |
| V7 + A first word ≤3 | balanced | 1000 | 10.2 ± 0.0 | 98% | 37% (34–40) | 61% (58–64) | 3% | 3.9 ± 0.2 | 0% | 0.5 ± 0.0 | 31% | 2.1 | 437 | 12% | 0.0 | 0% |
| V7 + A first word ≤3 | lookahead | 1000 | 10.0 ± 0.0 | 98% | 39% (36–42) | 57% (54–60) | 3% | 3.8 ± 0.2 | 0% | 0.5 ± 0.0 | 32% | 2.1 | 450 | 12% | 0.0 | 0% |
| V7 + A first word ≤4 | balanced | 1000 | 10.2 ± 0.0 | 98% | 53% (50–56) | 42% (39–45) | 5% | 3.6 ± 0.2 | 0% | 0.9 ± 0.0 | 36% | 2.0 | 418 | 12% | 0.0 | 0% |
| V7 + A first word ≤4 | lookahead | 1000 | 10.0 ± 0.0 | 99% | 53% (50–56) | 42% (39–45) | 4% | 3.7 ± 0.2 | 0% | 0.9 ± 0.0 | 34% | 2.0 | 430 | 11% | 0.0 | 0% |

End reasons:

- V7 / balanced: both_passed 658, full 342
- V7 / lookahead: both_passed 711, full 289
- V7 + B +1 / balanced: both_passed 688, full 312
- V7 + B +1 / lookahead: both_passed 673, full 327
- V7 + B +2 / balanced: both_passed 693, full 307
- V7 + B +2 / lookahead: both_passed 703, full 297
- V7 + B +3 / balanced: both_passed 691, full 309
- V7 + B +3 / lookahead: both_passed 715, full 285
- V7 + A first word ≤3 / balanced: both_passed 666, full 334
- V7 + A first word ≤3 / lookahead: both_passed 651, full 349
- V7 + A first word ≤4 / balanced: both_passed 596, full 404
- V7 + A first word ≤4 / lookahead: both_passed 594, full 406

