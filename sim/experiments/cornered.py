"""Cornered loses: the first player with no legal move loses."""

from wordrush_sim.engine.rules import V4, V8
from wordrush_sim.runner import Experiment, Variant

V9 = V8.with_(stuck="lose")  # as run on 2026-11-03: v3 (with B's +0.5) plus cornered loses

EXPERIMENT = Experiment(
    name="cornered",
    description=(
        "Rules v3 (stuck player passes) against rules v3 with 'cornered loses'. "
        "Also 'cornered loses' without the first-player fix (A's 4-letter first word, B's +0.5), "
        "to see whether the fix is still needed. Mirror matches show fairness; mixed matches show whether skill wins."
    ),
    variants=[
        Variant("v3 (stuck passes)", V8),
        Variant("v3 + cornered loses", V9),
        Variant("cornered loses, no first-player fix", V4.with_(stuck="lose")),
    ],
    matchups=[
        ("balanced", "balanced"),
        ("aggressive", "aggressive"),
        ("lookahead", "lookahead"),
        ("random", "balanced"),
        ("greedy", "balanced"),
        ("balanced", "lookahead"),
    ],
    games=1000,
)
