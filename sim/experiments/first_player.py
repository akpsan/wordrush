"""First-player compensation options under V7."""

from wordrush_sim.engine.rules import V7
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="first_player",
    description="V7 with candidate fixes for A's first-move edge: bonus cells for B, or a shorter first word for A.",
    variants=[
        Variant("V7", V7),
        Variant("V7 + B +1", V7.with_(b_bonus=1)),
        Variant("V7 + B +2", V7.with_(b_bonus=2)),
        Variant("V7 + B +3", V7.with_(b_bonus=3)),
        Variant("V7 + A first word ≤3", V7.with_(a_first_max_len=3)),
        Variant("V7 + A first word ≤4", V7.with_(a_first_max_len=4)),
    ],
    matchups=[("balanced", "balanced"), ("lookahead", "lookahead")],
    games=1000,
)
