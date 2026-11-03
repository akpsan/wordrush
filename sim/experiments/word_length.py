"""Rules v3 (V8): does a 4-letter maximum for everyone fix the first-player edge?"""

from wordrush_sim.engine.rules import V4 as V8  # Rules v3 before the first-player fix
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="word_length",
    description=(
        "Rules v3 (V8: no revive, no crossing, no timer). Compares the 5-letter maximum, "
        "a 4-letter maximum for every word by both players, and a 4-letter limit on A's first word only."
    ),
    variants=[
        Variant("V8 max 5", V8),
        Variant("V8 max 4 for all", V8.with_(max_len=4)),
        Variant("V8 A first word ≤4", V8.with_(a_first_max_len=4)),
    ],
    matchups=[("balanced", "balanced"), ("lookahead", "lookahead")],
    games=1000,
)
