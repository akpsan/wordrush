"""Hex mode prototype: Rules v4 on a hexagon (three line directions) against the square board."""

from wordrush_sim.engine.rules import HEX1, V9
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="hex",
    description=(
        "Rules v4 on the 8x8 square (baseline) against the same rules on a hexagon of radius 4 "
        "(61 cells, HEX1) and radius 5 (91 cells), each also with A's first word cut to 3 letters. "
        "Words on a hexagon run across, down-right or down-left. "
        "Mirror matches show fairness and game length; mixed matches show whether skill wins."
    ),
    variants=[
        Variant("square (v4)", V9),
        Variant("hex r4 (HEX1)", HEX1),
        Variant("hex r5", HEX1.with_(n=11)),
        Variant("hex r4, A's first word 3 letters", HEX1.with_(a_first_max_len=3)),
        Variant("hex r5, A's first word 3 letters", HEX1.with_(n=11, a_first_max_len=3)),
        Variant("hex r5, no first-word limit", HEX1.with_(n=11, a_first_max_len=5)),
    ],
    matchups=[
        ("balanced", "balanced"),
        ("aggressive", "aggressive"),
        ("random", "balanced"),
    ],
    games=300,
)
