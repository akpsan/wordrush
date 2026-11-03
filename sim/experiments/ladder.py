"""Rule ladder: V1 (rules as written) through V7 (Rules v2 plus the zero-words loss)."""

from wordrush_sim.engine.rules import PRESETS
from wordrush_sim.runner import Experiment, Variant

EXPERIMENT = Experiment(
    name="ladder",
    description=(
        "Each step adds one group of changes from docs/rules.md. V1: rules as written. V2: stuck player passes. "
        "V3: start or end on the chain letter. V4: corner starts. V5: crossing on a matching letter. "
        "V6: stuck player revives from any own word, timed-out words banned. V7: 2-new-cell minimum, zero-words loss."
    ),
    variants=[Variant(name, rules) for name, rules in PRESETS.items()],
    matchups=[("balanced", "balanced"), ("lookahead", "lookahead")],
    games=1000,
    notes={"trap_letters": True},
)
