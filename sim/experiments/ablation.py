"""Ablation: start from V7 and undo one change at a time."""

from wordrush_sim.engine.rules import V7
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="ablation",
    description="V7 baseline, then V7 with exactly one change undone. Shows what each change is worth on its own.",
    variants=[
        Variant("V7", V7),
        Variant("V7 − start-or-end", V7.with_(anchor="start")),
        Variant("V7 − corner starts", V7.with_(opening="anywhere")),
        Variant("V7 − crossing", V7.with_(crossing=False)),
        Variant("V7 − 2-cell minimum", V7.with_(min_new_cells=1)),
        Variant("V7 − revive (pass only)", V7.with_(stuck="pass")),
        Variant("V7 − revive (stuck ends game)", V7.with_(stuck="end")),
    ],
    matchups=[("balanced", "balanced")],
    games=1000,
)
