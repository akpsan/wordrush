"""Experiments: which rule variants, which bot matchups, how many games.

Matchups between different bots are paired: each seed is played twice with
sides swapped, so first-player advantage cancels out of bot comparisons.
"""

from __future__ import annotations

import hashlib
import json
import os
import random
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime
from multiprocessing import Pool
from pathlib import Path

from ..engine.geometry import geometry
from ..agents import make_agent
from ..engine import STUCK, TIMEOUT, Rules, apply, encode, get_lexicon, legal_moves, new_game

RUNS_DIR = Path(__file__).resolve().parents[3] / "runs"


@dataclass(frozen=True)
class Variant:
    name: str
    rules: Rules
    dictionary: str = "everyday-3to5"
    timeout_prob: float = 0.0
    """Chance that a turn with a legal move is replaced by a timeout. Tests mechanics only."""

    def to_dict(self) -> dict:
        return {"rules": self.rules.to_dict(), "dictionary": self.dictionary, "timeout_prob": self.timeout_prob}


@dataclass
class Experiment:
    name: str
    description: str
    variants: list
    matchups: list
    games: int = 1000
    """Games per variant and matchup."""
    seed: int = 1
    notes: dict = field(default_factory=dict)

    def jobs(self) -> list:
        out = []
        for v in self.variants:
            for a, b in self.matchups:
                if a == b:
                    for i in range(self.games):
                        out.append((v, (a, b), game_seed(self.seed, v.name, a, b, i), None))
                else:
                    for i in range(self.games // 2):
                        seed = game_seed(self.seed, v.name, *sorted((a, b)), i)
                        out.append((v, (a, b), seed, i))
                        out.append((v, (b, a), seed, i))
        return out


def game_seed(*parts) -> int:
    digest = hashlib.sha256(":".join(map(str, parts)).encode()).digest()
    return int.from_bytes(digest[:8], "big")


def play_game(job) -> dict:
    variant, agent_names, seed, pair = job
    lex = get_lexicon(variant.dictionary)
    agents = [make_agent(name) for name in agent_names]
    rngs = [random.Random(seed * 2 + side) for side in (0, 1)]
    timeout_rng = random.Random(seed ^ 0x5EED)
    n = variant.rules.n
    state = new_game(variant.rules, lex)
    plies = []
    while not state.over:
        p = state.to_move
        chained = bool(state.chains[p])
        moves = legal_moves(state)
        if not moves:
            move = STUCK
        elif variant.timeout_prob and timeout_rng.random() < variant.timeout_prob:
            move = TIMEOUT
        else:
            move = agents[p].choose(state, moves, rngs[p])
        state = apply(state, move)
        plies.append([encode(move, n), len(moves) if chained else None, state.score(0), state.score(1)])
    return {
        "variant": variant.name,
        "agents": list(agent_names),
        "seed": seed,
        "pair": pair,
        "plies": plies,
        "scores": [state.score(0), state.score(1)],
        "winner": state.winner,
        "reason": state.reason,
        "words": state.words_played,
        "timeouts": state.timeouts,
        "filled": state.filled(),
        "cells": geometry(variant.rules.board, n).cells,
    }


def run(exp: Experiment, workers: int | None = None, out_dir: Path | None = None) -> Path:
    jobs = exp.jobs()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = out_dir or RUNS_DIR / exp.name / stamp
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "experiment": exp.name,
        "description": exp.description,
        "created": stamp,
        "games": exp.games,
        "seed": exp.seed,
        "matchups": exp.matchups,
        "variants": {v.name: v.to_dict() for v in exp.variants},
        "variant_order": [v.name for v in exp.variants],
        "notes": exp.notes,
        "python": sys.version.split()[0] + (" (PyPy)" if "PyPy" in sys.version else ""),
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))
    workers = workers or os.cpu_count() or 1
    started = time.time()
    done = 0
    step = max(1, len(jobs) // 20)
    with open(out_dir / "games.jsonl", "w") as f, Pool(workers) as pool:
        for record in pool.imap_unordered(play_game, jobs, chunksize=2):
            f.write(json.dumps(record, separators=(",", ":")) + "\n")
            done += 1
            if done % step == 0 or done == len(jobs):
                rate = done / (time.time() - started)
                left = (len(jobs) - done) / rate if rate else 0
                print(f"[{exp.name}] {done}/{len(jobs)} games, ~{left:.0f}s left", flush=True)
    (out_dir.parent / "LATEST").write_text(out_dir.name)
    return out_dir
