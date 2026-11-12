---
name: product-loop
description: Run one product cycle for WordRush as its product manager - discover (play the game, simulator and bot runs, market scan, owner comments), decide (score the backlog), build one or two items, verify, ship (PR + merge into main, which deploys), and record it all in docs/product.md. Works the backlog first; brainstorms only when nothing on it fits. Use when the owner says to run the product loop or a product cycle.
---

# WordRush product loop

**Goal:** a fun, easy-to-pick-up time waster for people of every skill level. Judge every idea against it.

**State:** `docs/product.md` in the repo is the source of truth (Backlog, Insights, Shipped, Nightly runs). Read it first and update it in the same PR as the change. The shared product doc (https://claude.ai/artifact/E65v4kRwrsM6t1Xw38kGtn) mirrors it for the owner: if this session has the docs tools, read its comments first and update it too; if not, skip it (scheduled runs have no connectors). Owner comments and edits outrank your own scores.

**Autonomy:** full, including merging into `main` (the default branch), which deploys the live site through Cloudflare Workers Builds. Only merge once the checks pass. Rule or balance changes must keep the Python simulator (`engine/rules.py`) and the TypeScript engine in step (conformance test), with simulator evidence; add a new preset, never redefine an old one.

## One cycle

1. **Discover** (cheap first: text output before screenshots). **Backlog first:** while the backlog has an item marked Next or Planned that fits the run's budget, skip the rest of this step: read `docs/product.md`, then go straight to Decide. Only brainstorm new items when nothing on the backlog fits, and never build an item added in the same run.
   - Play the game: a first-timer path (menu, tutorial, first AI game) and a returning path, at phone (390x844) and desktop (1440x900). Note friction: unclear moments, dead ends, waiting, missing feedback, anything that isn't fun.
   - Game health: simulator and AI calibration (`sim/CLAUDE.md`, `app/scripts/calibrate-ai.ts`). Look at fairness, game length, early losses, how often a weaker vocabulary gets stuck.
   - Market: a few web searches on what makes casual word and puzzle games sticky. Take mechanics and genre conventions only; never copy a specific game's name, art or levels.
   - Write each finding to Insights (`docs/product.md`) with its evidence and date.
2. **Decide.** Add or update Backlog rows (problem, idea, impact 1-5, confidence 1-5, effort 1-5, score = impact x confidence / effort, status). Pick the top one or two that fit in one session.
3. **Build** in the repo's layers (`docs/app-architecture.md`): rules only in `engine/`, copy only in `copy/` (new strings in `copy/overrides.ts`), decisions in `docs/ui-decisions.md`.
4. **Verify.** `npm run typecheck`, `npm run lint`, `npx vitest run`, and the e2e specs except the macOS-only screenshot tests. In cloud sessions run Playwright with `launchOptions.executablePath: '/opt/pw-browsers/chromium'` and `channel: undefined` (a temporary config that imports `playwright.config.ts`). Check the item's own success measure, and screenshot what changed.
5. **Ship.** Work on a branch off `main` named `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>` or `docs/<short-name>`. Commit, push, open a PR into `main`, merge it (this deploys). In `docs/product.md` (and the product doc, when reachable): move the item to Shipped with the PR link, add follow-up ideas to the Backlog, and for scheduled runs add a line under Nightly runs.

## Budget

One or two items per cycle. Commit after each item so a cut-off run loses nothing. Prefer targeted reads (grep, line ranges), quiet command output, and small, shrunk screenshots.
