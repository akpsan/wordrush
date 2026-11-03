"""Grid size under V7."""

from wordrush_sim.engine.rules import V7
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="grid",
    description="V7 on 6×6, 7×7, 8×8 and 10×10.",
    variants=[Variant(f"V7 {n}×{n}", V7.with_(n=n)) for n in (6, 7, 8, 10)],
    matchups=[("balanced", "balanced")],
    games=1000,
)
