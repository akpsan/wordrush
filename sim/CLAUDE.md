# Simulator notes (loaded when working in `sim/`)

## Commands (from `sim/`)

- `uv sync --extra dev` then `uv run pytest -q`. The tests replay the dry runs from `docs/rules.md` exactly.
- `uv run wordrush-sim run experiments/<name>.py [--games N]` runs an experiment and writes `reports/<name>.md`.
- `uv run wordrush-sim report <name>` rebuilds a report from the latest run; `uv run wordrush-sim replay <name> <index>` prints a game board by board.
- For big runs, use PyPy (about 1.5–2× faster): `UV_PROJECT_ENVIRONMENT=.venv-pypy uv run --python pypy@3.12 wordrush-sim run ...`. Keep the code pure Python with no compiled dependencies so this keeps working.
- Rule presets V1–V9 (`CURRENT` = the current rules) are in `engine/rules.py`. Bots are registered in `agents/bots.py` (`AGENTS`).
- After a rule change, regenerate the app's conformance fixture: `uv run python scripts/export_conformance.py`.

## Conventions

- Run commands from `sim/`.
- Keep the engine pure: `apply(state, move) -> state` and `legal_moves(state)`. No I/O, randomness, timing or bot logic in `engine/`.
- Every rule variant is a field on the rules config, never a code branch scattered across modules.
- Randomness only comes from seeds passed in by the runner, so every game is reproducible.
- Game records are JSONL: one line per game with the seed, config, agents and move list.
- Statistics are computed in code. The LLM reviewer reads results and replays; it never does the counting.

## Simulation decisions

- No timer, in the game or the simulation. Timeout rules in the engine are only kept to replay older experiments.
- Compare variants with paired games (same seed, sides swapped), 1,000+ games per variant, and report confidence intervals.
- Change one rule at a time against a baseline (ablation).
