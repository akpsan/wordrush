# WordRush

A two-player word game on a shared 8 × 8 grid. Each player grows a chain of words from their own last word, every letter on the board blocks new words, and **the player who gets boxed in first loses**.

The repo holds the game's rules, the simulation lab used to design them, the UI design, and the web app.

## Where things are

```
wordrush/
├── docs/
│   ├── rules.md              Current rules (v4), plus earlier versions and dry runs as history
│   ├── findings.md           What the simulations showed, and the decisions they led to
│   ├── ui-decisions.md       UI and UX decisions; takes precedence over the design's dev notes
│   ├── app-architecture.md   How the web app is layered, and the rules for keeping it modular
│   └── decisions/            Design decision records
├── data/dictionaries/        Word lists, shared by the simulator and the app
├── design/handoff/           UI design from Claude Design: screens, styles, copy deck, glossary
├── sim/                      Python simulation lab (engine, bots, experiments, reports)
└── app/                      The web game (Vite, React, TypeScript)
```

## Getting started

**Simulator** (Python, managed with [uv](https://docs.astral.sh/uv/)), from `sim/`:

```bash
uv sync --extra dev
uv run pytest -q                                   # engine tests, including the dry runs
uv run wordrush-sim run experiments/cornered.py    # run an experiment, writes reports/cornered.md
```

**App** (Node.js), from `app/`:

```bash
npm install
npm test            # engine tests, including 1,350 replayed simulator games
npm run dev         # local dev server
```

**Design screens:** serve `design/handoff/design/` over HTTP (`python3 -m http.server`) and open it in a browser.

## Principles

- The rules live in one engine per language: Python for simulation, TypeScript for the app. A conformance test keeps them identical.
- Every rule is a setting, so a rule change is a config change, not new code paths.
- Generated simulation output (`sim/runs/`) is never committed. Experiment definitions and their reports are.
