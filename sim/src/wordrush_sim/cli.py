"""Command line: run experiments and build reports.

    wordrush-sim run experiments/ladder.py [--games N] [--workers K]
    wordrush-sim report ladder            # latest run of an experiment, or a run directory
    wordrush-sim replay ladder 12         # print the boards of game 12 in the latest run
"""

from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path

from .analysis import write_report
from .records import load_run, replay, resolve_run
from .runner import run


def load_experiment(path: str):
    spec = importlib.util.spec_from_file_location(Path(path).stem, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.EXPERIMENT


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(prog="wordrush-sim")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_run = sub.add_parser("run", help="run an experiment file and write its report")
    p_run.add_argument("experiment")
    p_run.add_argument("--games", type=int)
    p_run.add_argument("--workers", type=int)
    p_rep = sub.add_parser("report", help="rebuild the report for a run")
    p_rep.add_argument("target")
    p_play = sub.add_parser("replay", help="print a recorded game move by move")
    p_play.add_argument("target")
    p_play.add_argument("index", type=int)
    args = parser.parse_args(argv)

    if args.cmd == "run":
        exp = load_experiment(args.experiment)
        if args.games:
            exp.games = args.games
        out = run(exp, workers=args.workers)
        print(f"games: {out / 'games.jsonl'}")
        print(f"report: {write_report(out)}")
    elif args.cmd == "report":
        print(write_report(resolve_run(args.target)))
    elif args.cmd == "replay":
        manifest, games = load_run(resolve_run(args.target))
        record = games[args.index]
        print(f"{record['variant']}: {record['agents'][0]} (A) vs {record['agents'][1]} (B), seed {record['seed']}")
        for ply, (state, entry) in enumerate(zip(replay(manifest, record), record["plies"]), 1):
            player = "A" if ply % 2 else "B"
            print(f"\n{ply}. {player} {entry[0]}   A {entry[2]} – B {entry[3]}")
            print(state.render())
        print(f"\nResult: {record['reason']}, winner {['A', 'B', 'draw'][record['winner'] if record['winner'] is not None else 2]}")


if __name__ == "__main__":
    main()
