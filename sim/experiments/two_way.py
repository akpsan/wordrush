"""Any-direction words: hex mode (HEX) against the same rules with words also allowed to read backwards."""

from wordrush_sim.engine.rules import HEX
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="two_way",
    description=(
        "Hex mode as adopted (HEX: radius 5, A's first word at most 3 letters, words read left to right or "
        "downwards) against the same rules with words also allowed to read backwards (right to left or upwards), "
        "which doubles the line directions. Owner playtests found one-way words confusing; this checks what "
        "allowing both ways would do to fairness, game length and skill."
    ),
    variants=[
        Variant("hex (one way)", HEX),
        Variant("hex, two-way words", HEX.with_(two_way=True)),
    ],
    matchups=[
        ("balanced", "balanced"),
        ("aggressive", "aggressive"),
        ("random", "balanced"),
    ],
    games=200,
)
