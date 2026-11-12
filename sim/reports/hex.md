# hex

Rules v4 on the 8x8 square (baseline) against the same rules on a hexagon of radius 4 (61 cells, HEX1) and radius 5 (91 cells), each also with A's first word cut to 3 letters. Words on a hexagon run across, down-right or down-left. Mirror matches show fairness and game length; mixed matches show whether skill wins.

Run `20261112-125456` · 5400 games · seed 1 · Python 3.12.3

Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.

## Same bot on both sides

| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws | Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn | Turns with ≤3 moves | Timeouts | Zero-words losses |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| square (v4) | aggressive | 300 | 6.8 ± 0.2 | 67% | 55% (49–61) | 45% (39–51) | 0% | 2.4 ± 0.2 | 0% | 0.5 ± 0.1 | 29% | 1.0 | 511 | 8% | 0.0 | 0% |
| square (v4) | balanced | 300 | 6.0 ± 0.2 | 61% | 50% (44–56) | 50% (44–56) | 0% | 1.8 ± 0.2 | 0% | 0.5 ± 0.1 | 27% | 1.0 | 564 | 9% | 0.0 | 0% |
| hex r4 (HEX1) | aggressive | 300 | 6.2 ± 0.1 | 66% | 49% (43–55) | 51% (45–57) | 0% | 1.6 ± 0.1 | 0% | 0.5 ± 0.1 | 23% | 1.0 | 709 | 9% | 0.0 | 0% |
| hex r4 (HEX1) | balanced | 300 | 5.5 ± 0.1 | 61% | 85% (80–88) | 15% (12–20) | 0% | 2.6 ± 0.2 | 0% | 0.8 ± 0.0 | 11% | 1.0 | 821 | 10% | 0.0 | 0% |
| hex r5 | aggressive | 300 | 8.4 ± 0.1 | 64% | 31% (26–37) | 69% (63–74) | 0% | 2.5 ± 0.2 | 0% | 0.7 ± 0.1 | 52% | 1.0 | 932 | 6% | 0.0 | 0% |
| hex r5 | balanced | 300 | 8.2 ± 0.1 | 62% | 48% (42–53) | 52% (47–58) | 0% | 3.0 ± 0.3 | 0% | 0.9 ± 0.1 | 41% | 1.0 | 1009 | 7% | 0.0 | 0% |
| hex r4, A's first word 3 letters | aggressive | 300 | 6.2 ± 0.1 | 65% | 29% (24–34) | 71% (66–76) | 0% | 2.8 ± 0.2 | 0% | 0.2 ± 0.0 | 50% | 1.0 | 669 | 9% | 0.0 | 0% |
| hex r4, A's first word 3 letters | balanced | 300 | 6.2 ± 0.1 | 66% | 48% (42–54) | 52% (46–58) | 0% | 2.3 ± 0.2 | 0% | 0.4 ± 0.1 | 46% | 1.0 | 745 | 9% | 0.0 | 0% |
| hex r5, A's first word 3 letters | aggressive | 300 | 8.4 ± 0.1 | 64% | 44% (39–50) | 56% (50–61) | 0% | 2.9 ± 0.2 | 0% | 0.4 ± 0.1 | 42% | 1.0 | 1012 | 6% | 0.0 | 0% |
| hex r5, A's first word 3 letters | balanced | 300 | 8.4 ± 0.1 | 64% | 52% (47–58) | 48% (42–53) | 0% | 3.4 ± 0.3 | 0% | 0.6 ± 0.1 | 43% | 1.0 | 1081 | 6% | 0.0 | 0% |
| hex r5, no first-word limit | aggressive | 300 | 7.4 ± 0.2 | 59% | 67% (61–72) | 33% (28–39) | 0% | 4.4 ± 0.3 | 0% | 0.4 ± 0.1 | 30% | 1.0 | 1022 | 7% | 0.0 | 0% |
| hex r5, no first-word limit | balanced | 300 | 7.2 ± 0.2 | 57% | 66% (60–71) | 34% (29–40) | 0% | 4.1 ± 0.3 | 0% | 0.3 ± 0.1 | 30% | 1.0 | 1126 | 7% | 0.0 | 0% |

End reasons:

- square (v4) / aggressive: cornered 300
- square (v4) / balanced: cornered 300
- hex r4 (HEX1) / aggressive: cornered 300
- hex r4 (HEX1) / balanced: cornered 300
- hex r5 / aggressive: cornered 300
- hex r5 / balanced: cornered 300
- hex r4, A's first word 3 letters / aggressive: cornered 300
- hex r4, A's first word 3 letters / balanced: cornered 300
- hex r5, A's first word 3 letters / aggressive: cornered 300
- hex r5, A's first word 3 letters / balanced: cornered 300
- hex r5, no first-word limit / aggressive: cornered 300
- hex r5, no first-word limit / balanced: cornered 300

## Bot against bot (paired: each seed played from both sides)

| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |
| --- | --- | --- | --- | --- | --- | --- |
| square (v4) | random vs balanced | 300 | 23% (18–28) | 77% (72–82) | 55% | 5.7 |
| hex r4 (HEX1) | random vs balanced | 300 | 10% (7–14) | 90% (86–93) | 54% | 5.0 |
| hex r5 | random vs balanced | 300 | 21% (16–26) | 79% (74–84) | 49% | 7.2 |
| hex r4, A's first word 3 letters | random vs balanced | 300 | 8% (5–11) | 92% (89–95) | 50% | 5.2 |
| hex r5, A's first word 3 letters | random vs balanced | 300 | 17% (13–22) | 83% (78–87) | 52% | 7.0 |
| hex r5, no first-word limit | random vs balanced | 300 | 14% (11–18) | 86% (82–89) | 43% | 6.7 |

