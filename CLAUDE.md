# WordRush: notes for coding agents

Two-player word chain game on a grid (Tron light cycles crossed with Shiritori). Rules: `docs/rules.md`. Simulation findings: `docs/findings.md`. Decisions: `docs/decisions/`, `docs/ui-decisions.md`. Layout: `README.md`.

Simulator commands, conventions and simulation decisions: `sim/CLAUDE.md`.

## Repo conventions

- Don't create folders for future phases until they're needed.

## Game

- Input: players type their own words on an on-screen keyboard (Wordle-style). No suggestions, no timer, so no timeout rules (decided 2026-11-03).
- Two modes: Play a friend (pass and play) and Play vs AI (Pip/Easy, Juno/Medium, Rex/Hard). The app's AIs (`app/src/ai/`) are TypeScript ports of the simulator's bots that prefer everyday words; calibrate them with `app/scripts/calibrate-ai.ts`.
- Simulator bots choose from all legal moves, which matches typing by a player with a big vocabulary. Real players know fewer words, which the bots don't model yet.

## App

- `app/` is the web game. Its layers and modularity rules are in `docs/app-architecture.md`. Follow them: no rule logic outside `engine/`, no copy outside `copy/`.
- Design source of truth: `design/handoff/` (serve `design/handoff/design` over HTTP to view), the copy deck, and `docs/ui-decisions.md`, which wins over the handoff's dev notes.
- The TypeScript engine must stay in step with the simulator: the conformance test replays simulator games.

## Current rules

Rules v4 in `docs/rules.md`, which is `CURRENT` (= `V9`) in `engine/rules.py`: no revive, no crossing, no timer, **a cornered player loses**, A's first word at most 4 letters, and any word in `data/dictionaries/playable-3to5.txt` counts (hints use `hints-3to5.txt`). If the board fills (never seen in simulation), more cells wins and B wins a tie. Older presets (V1–V8) and the experiments that used them are kept for reproducibility; don't redefine them.
