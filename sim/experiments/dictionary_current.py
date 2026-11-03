"""Current rules (v4, cornered loses) with the everyday list against the full ENABLE list.

The app accepts the full list (players type their own words), so balance must hold with it.
"""

from wordrush_sim.engine.rules import CURRENT
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="dictionary_current",
    description="Rules v4 with the everyday list (2,472 words) and the full ENABLE list (13,511 words).",
    variants=[
        Variant("v4 everyday", CURRENT),
        Variant("v4 full ENABLE", CURRENT, dictionary="enable-3to5"),
    ],
    matchups=[("balanced", "balanced"), ("lookahead", "lookahead"), ("random", "balanced")],
    games=1000,
)
