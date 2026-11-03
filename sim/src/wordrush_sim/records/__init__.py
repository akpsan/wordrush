"""JSONL game records and deterministic replay.

A record holds the variant, agents, seed and per-ply entries
[move, legal moves available (None before the mover's first word), score A, score B].
Board states are never stored; `replay` rebuilds them.
"""

from __future__ import annotations

import json
from pathlib import Path

from ..engine import Rules, apply, decode, get_lexicon, new_game


def load_run(run_dir: Path) -> tuple[dict, list]:
    manifest = json.loads((run_dir / "manifest.json").read_text())
    with open(run_dir / "games.jsonl") as f:
        games = [json.loads(line) for line in f]
    return manifest, games


def replay(manifest: dict, record: dict):
    """Yield the state after each ply of a recorded game."""
    spec = manifest["variants"][record["variant"]]
    rules = Rules(**spec["rules"])
    state = new_game(rules, get_lexicon(spec["dictionary"]))
    for move_text, *_ in record["plies"]:
        state = apply(state, decode(move_text, rules.n))
        yield state


def resolve_run(target: str) -> Path:
    """Accept a run directory or an experiment name (uses its latest run)."""
    from ..runner.experiment import RUNS_DIR

    path = Path(target)
    if (path / "manifest.json").exists():
        return path
    exp_dir = RUNS_DIR / target
    return exp_dir / (exp_dir / "LATEST").read_text().strip()
