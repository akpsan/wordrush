"""Skill: every bot against every bot under V7."""

from itertools import combinations

from wordrush_sim.agents import AGENTS
from wordrush_sim.engine.rules import V7
from wordrush_sim.runner import Experiment, Variant

names = list(AGENTS)
EXPERIMENT = Experiment(
    name="skill",
    description=(
        "V7, round robin between all bots, plus each bot against itself. Checks that skill wins, "
        "which styles dominate, and whether first-player advantage depends on skill."
    ),
    variants=[Variant("V7", V7)],
    matchups=[(n, n) for n in names] + list(combinations(names, 2)),
    games=400,
)
