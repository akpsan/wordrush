# dictionary

Everyday list (2,472 words) against the full ENABLE list (13,511 words), under V7 and under V4 (no crossing).

Run `20261103-120231` · 4000 games · seed 1 · Python 3.12.15 (PyPy)

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V7 everyday | balanced | 1000 | 10.0 ± 0.0 | 98% | 73% (70–76) | 22% (20–25) | 5% | 4.5 ± 0.2 | 0% | 0.5 ± 0.0 | 21% | 2.3 | 398 | 13% | 0.0 | 0% |
| V7 full ENABLE | balanced | 1000 | 10.1 ± 0.0 | 98% | 73% (70–76) | 21% (19–24) | 6% | 3.7 ± 0.2 | 0% | 0.5 ± 0.0 | 19% | 2.1 | 1783 | 12% | 0.0 | 0% |
| V4 everyday | balanced | 1000 | 6.5 ± 0.0 | 69% | 75% (73–78) | 20% (17–22) | 5% | 4.9 ± 0.2 | 0% | 0.2 ± 0.0 | 12% | 2.8 | 435 | 20% | 0.0 | 0% |
| V4 full ENABLE | balanced | 1000 | 6.7 ± 0.0 | 71% | 59% (56–62) | 35% (32–38) | 6% | 5.6 ± 0.2 | 0% | 0.3 ± 0.0 | 22% | 3.4 | 2040 | 23% | 0.0 | 0% |

End reasons:

- V7 everyday / balanced: both_passed 708, full 292
- V7 full ENABLE / balanced: both_passed 727, full 273
- V4 everyday / balanced: both_passed 1000
- V4 full ENABLE / balanced: both_passed 1000

## Word endings and the next turn

### V7 everyday

| Last letter | Words | Next-turn legal moves | Stuck next turn |
| --- | --- | --- | --- |
| B | 97 | 199 | 9% |
| O | 224 | 224 | 13% |
| W | 135 | 231 | 17% |
| I | 142 | 236 | 10% |
| K | 157 | 243 | 12% |
| C | 154 | 252 | 12% |
| M | 297 | 254 | 16% |
| N | 644 | 255 | 14% |
| H | 293 | 256 | 9% |
| A | 601 | 266 | 7% |
| R | 496 | 274 | 8% |
| X | 94 | 293 | 12% |
| D | 865 | 297 | 12% |
| F | 57 | 323 | 11% |
| P | 483 | 326 | 12% |
| L | 690 | 349 | 9% |
| T | 2334 | 349 | 8% |
| G | 171 | 400 | 9% |
| Y | 655 | 413 | 7% |
| E | 4344 | 426 | 7% |
| S | 6491 | 538 | 6% |

### V7 full ENABLE

| Last letter | Words | Next-turn legal moves | Stuck next turn |
| --- | --- | --- | --- |
| C | 152 | 671 | 26% |
| G | 189 | 866 | 16% |
| P | 417 | 931 | 14% |
| W | 172 | 947 | 20% |
| B | 240 | 964 | 11% |
| R | 501 | 980 | 8% |
| O | 373 | 983 | 11% |
| N | 427 | 995 | 11% |
| U | 129 | 1001 | 8% |
| F | 92 | 1026 | 15% |
| T | 1201 | 1034 | 9% |
| A | 1175 | 1042 | 10% |
| K | 197 | 1069 | 12% |
| M | 254 | 1151 | 17% |
| L | 404 | 1162 | 11% |
| D | 526 | 1183 | 13% |
| I | 323 | 1193 | 11% |
| X | 70 | 1215 | 4% |
| E | 2342 | 1335 | 9% |
| Y | 654 | 1567 | 11% |
| H | 479 | 1881 | 7% |
| S | 9479 | 2538 | 5% |

### V4 everyday

| Last letter | Words | Next-turn legal moves | Stuck next turn |
| --- | --- | --- | --- |
| B | 60 | 118 | 23% |
| W | 62 | 155 | 24% |
| G | 59 | 175 | 29% |
| N | 474 | 181 | 36% |
| K | 87 | 182 | 34% |
| I | 69 | 188 | 22% |
| H | 102 | 216 | 15% |
| M | 127 | 228 | 30% |
| A | 317 | 229 | 9% |
| C | 71 | 238 | 23% |
| R | 291 | 286 | 25% |
| P | 308 | 301 | 17% |
| D | 566 | 305 | 15% |
| T | 1642 | 350 | 14% |
| E | 3472 | 381 | 26% |
| Y | 416 | 397 | 13% |
| L | 326 | 513 | 16% |
| S | 4435 | 707 | 4% |

### V4 full ENABLE

| Last letter | Words | Next-turn legal moves | Stuck next turn |
| --- | --- | --- | --- |
| U | 51 | 769 | 25% |
| G | 99 | 819 | 33% |
| O | 175 | 885 | 26% |
| N | 229 | 955 | 26% |
| A | 627 | 1004 | 19% |
| T | 981 | 1014 | 21% |
| B | 127 | 1017 | 27% |
| P | 327 | 1108 | 17% |
| E | 2021 | 1116 | 31% |
| W | 69 | 1121 | 22% |
| D | 276 | 1193 | 21% |
| C | 75 | 1206 | 13% |
| M | 142 | 1233 | 21% |
| K | 180 | 1295 | 14% |
| L | 249 | 1467 | 14% |
| R | 223 | 1533 | 8% |
| I | 163 | 1650 | 17% |
| H | 255 | 2547 | 8% |
| Y | 333 | 2575 | 20% |
| S | 6705 | 3261 | 7% |

