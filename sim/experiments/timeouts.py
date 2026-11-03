"""Timeout mechanics with injected random timeouts. Tests that the rules hold up, not fairness."""

from wordrush_sim.engine.rules import V5, V7
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="timeouts",
    description=(
        "Each turn with a legal move is replaced by a timeout with the given probability. "
        "Checks for loops, runaway games and how often the zero-words loss decides a game. "
        "Bots don't time out for real, so this says nothing about whether 20 seconds is fair."
    ),
    variants=[
        Variant("V7 p=0.05", V7, timeout_prob=0.05),
        Variant("V7 p=0.15", V7, timeout_prob=0.15),
        Variant("V7 − zero-words loss p=0.15", V7.with_(zero_words_loss=False), timeout_prob=0.15),
        Variant("V7 − timeout ban p=0.15", V7.with_(timeout_ban=False), timeout_prob=0.15),
        Variant("V5 p=0.15", V5, timeout_prob=0.15),
    ],
    matchups=[("balanced", "balanced")],
    games=500,
)
