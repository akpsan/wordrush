# WordRush: notes for coding agents

Two-player word chain game on a grid (Tron light cycles crossed with Shiritori). Rules: `docs/rules.md`. Simulation findings: `docs/findings.md`. Decisions: `docs/decisions/`, `docs/ui-decisions.md`. Layout: `README.md`.

## Commands (from `sim/`)

- `uv sync --extra dev` then `uv run pytest -q`. The tests replay the dry runs from `docs/rules.md` exactly.
- `uv run wordrush-sim run experiments/<name>.py [--games N]` runs an experiment and writes `reports/<name>.md`.
- `uv run wordrush-sim report <name>` rebuilds a report from the latest run; `uv run wordrush-sim replay <name> <index>` prints a game board by board.
- For big runs, use PyPy (about 1.5–2× faster): `UV_PROJECT_ENVIRONMENT=.venv-pypy uv run --python pypy@3.12 wordrush-sim run ...`. Keep the code pure Python with no compiled dependencies so this keeps working.
- Rule presets V1–V9 (`CURRENT` = the current rules) are in `engine/rules.py`. Bots are registered in `agents/bots.py` (`AGENTS`).
- After a rule change, regenerate the app's conformance fixture: `uv run python scripts/export_conformance.py`.

## Conventions

- `sim/` is a Python package with a src layout (`sim/src/wordrush_sim/`). Run commands from `sim/`.
- Keep the engine pure: `apply(state, move) -> state` and `legal_moves(state)`. No I/O, randomness, timing or bot logic in `engine/`.
- Every rule variant is a field on the rules config, never a code branch scattered across modules.
- Randomness only comes from seeds passed in by the runner, so every game is reproducible.
- Game records are JSONL: one line per game with the seed, config, agents and move list.
- Statistics are computed in code. The LLM reviewer reads results and replays; it never does the counting.
- Don't create folders for future phases until they're needed.

## Game

- One mode: players type their own words on an on-screen keyboard (Wordle-style). No suggestions, no timer, so no timeout rules (decided 2026-11-03).
- Two modes: Play a friend (pass and play) and Play vs AI (Pip/Easy, Juno/Medium, Rex/Hard). The app's AIs (`app/src/ai/`) are TypeScript ports of the simulator's bots that prefer everyday words; calibrate them with `app/scripts/calibrate-ai.ts`.
- Simulator bots choose from all legal moves, which matches typing by a player with a big vocabulary. Real players know fewer words, which the bots don't model yet.

## App

- `app/` is the web game (Vite, React, TS). Its layers and modularity rules are in `docs/app-architecture.md`. Follow them: no rule logic outside `engine/`, no copy outside `copy/`.
- Design source of truth: `design/handoff/` (serve `design/handoff/design` over HTTP to view), the copy deck, and `docs/ui-decisions.md`, which wins over the handoff's dev notes.
- The TypeScript engine must stay in step with the simulator: the conformance test replays simulator games.

## Current rules

Rules v4 in `docs/rules.md`, which is `CURRENT` (= `V9`) in `engine/rules.py`: no revive, no crossing, no timer, **a cornered player loses**, A's first word at most 4 letters, and any word in `data/dictionaries/playable-3to5.txt` counts (hints use `hints-3to5.txt`). If the board fills (never seen in simulation), more cells wins and B wins a tie. Older presets (V1–V8) and the experiments that used them are kept for reproducibility; don't redefine them.

## Simulation decisions

- No timer, in the game or the simulation. Timeout rules in the engine are only kept to replay older experiments.
- Compare variants with paired games (same seed, sides swapped), 1,000+ games per variant, and report confidence intervals.
- Change one rule at a time against a baseline (ablation).
