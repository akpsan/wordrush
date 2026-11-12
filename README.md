# WordRush

A two-player word game on a shared 8 × 8 grid. Each player grows a chain of words from their own last word, every letter on the board blocks new words, and **the player who gets boxed in first loses**. Play a friend on one device, or play against an AI (Pip, Juno or Rex, easy to hard).

**Play it:** https://wordrush.akpsan.workers.dev

The repo holds the game's rules, the simulation lab used to design them, the UI design, and the web app.

**Read:** [How 87,300 simulated games shaped WordRush's rules](docs/blog/how-simulations-shaped-wordrush.md), the story of the method and what it changed.

## Where things are

```
wordrush/
├── docs/
│   ├── rules.md              Current rules (v4), plus earlier versions and dry runs as history
│   ├── findings.md           What the simulations showed, and the decisions they led to
│   ├── blog/                 Write-ups: how simulated games shaped the rules
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
npm test            # engine tests, including replayed simulator games (square and hex)
npm run dev         # local dev server
npm run deploy      # build and publish to Cloudflare by hand (needs `npx wrangler login` once)
```

**Branches and releases:** `main` is the default branch, and every merge into it deploys: Cloudflare Workers Builds (Cloudflare's GitHub app) builds `app/` and publishes https://wordrush.akpsan.workers.dev. Work happens on short-lived branches off `main`, named `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>` or `docs/<short-name>` (lowercase, hyphens), and lands through a pull request once the checks pass.

**Design screens:** serve `design/handoff/design/` over HTTP (`python3 -m http.server`) and open it in a browser.

## Principles

- The rules live in one engine per language: Python for simulation, TypeScript for the app. A conformance test keeps them identical.
- Every rule is a setting, so a rule change is a config change, not new code paths.
- Generated simulation output (`sim/runs/`) is never committed. Experiment definitions and their reports are.
