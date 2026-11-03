"""Dictionary size under V7 and V4."""

from wordrush_sim.engine.rules import V4, V7
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="dictionary",
    description=(
        "Everyday list (2,472 words) against the full ENABLE list (13,511 words), "
        "under V7 and under V4 (no crossing)."
    ),
    variants=[
        Variant("V7 everyday", V7),
        Variant("V7 full ENABLE", V7, dictionary="enable-3to5"),
        Variant("V4 everyday", V4),
        Variant("V4 full ENABLE", V4, dictionary="enable-3to5"),
    ],
    matchups=[("balanced", "balanced")],
    games=1000,
    notes={"trap_letters": True},
)
