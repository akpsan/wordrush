# App architecture

The web app lives in `app/` (Vite, React, TypeScript). It's built in layers. Each layer may only depend on the ones below it.

```
app/src/
├── engine/       Rules of the game. Pure TypeScript: no React, no browser APIs, immutable state.
├── ai/           The AI opponents (Easy, Medium, Hard): pure move pickers on top of the engine, with a
│                 seeded random source. worker.ts runs them in a Web Worker; client.ts (askAi) talks to it.
├── dictionary/   Loads the bundled word list (data/dictionaries/, shared with the simulator).
├── copy/         Every player-facing string. deck.ts is generated from the copy deck (npm run copy);
│                 overrides.ts holds the few strings the deck doesn't map 1:1. No other file contains copy.
├── theme/        Design tokens (CSS variables) and global styles, from the handoff's wordrush.css.
├── ui/           Shared building blocks with no game knowledge: Frame, Sheet, Icon, RichText, controls.
├── platform/     Small adapters for the outside world: storage, keyboard input, media queries.
├── features/     One folder per feature: game, menu, tutorial, settings, setup (Play vs AI setup and records).
│                 Each owns its components, model, state and styles. Other code uses a feature only
│                 through its index.ts. The tutorial reuses the game's Board, Entry and Keyboard that way.
└── app/          Navigation and player progress. Features report what happened (onExit, onMenu);
                  only the app decides which screen comes next.
```

## Rules for keeping it modular

- **The engine is the only place rules live.** UI code never re-implements a rule. It asks the engine (`previewEntry`, `checkEntry`, `legalMoves`, `waysOut`, `play`).
- **A rule change is a config change.** Board size, word lengths and the first-word limit are in `engine/rules.ts`. A new rule gets a field there first.
- **Features don't import each other's internals.** They communicate through props, the app layer, or small public `index.ts` files. Components import their own CSS, so reusing a component brings its styles along.
- **The AI is a player, not a rule.** It picks from the engine's legal moves, and its move reaches the game as an ordinary session action (`aiPlay`). The game's `Match` (pass and play, or vs AI) is the only place that knows who is a person; names go through `nameOf`.
- **Pre-made positions go through the engine** (`playScripted`). The menu board and the tutorial can never show an illegal position, and tests fail if a scripted word stops being valid.
- **Copy and tokens are data.** Changing wording or colors never touches logic.
- **Removing a feature** (for example hints) means deleting its folder and its one registration line in `app/`.

## Testing

- `engine/__tests__/conformance.test.ts` replays 1,350 simulator games. The TypeScript engine must make exactly the same decisions as the Python simulator. Regenerate the fixture with `sim/scripts/export_conformance.py` after a rule change.
- `ai/choose.test.ts`: every level plays legal moves to the end of a game, choices repeat for a seed, and Hard takes a box-in when there is one.
- `scripts/calibrate-ai.ts` (`npx vite-node scripts/calibrate-ai.ts [games]`): plays the levels against each other and a novice stand-in, with sides swapped, and reports win rates and thinking times. Results are in `docs/findings.md`.
- `engine/__tests__/engine.test.ts` pins the behaviors the design depends on: first moves, the tutorial script, check order, previews and ways out.
- `app/e2e/` (Playwright, `npm run e2e`): real flows, keyboard behaviour, WCAG 2.1 AA scans with axe-core in both themes, and screenshot tests at phone and desktop sizes. Screenshot baselines were checked by eye against the mockups; after an intended visual change, review and run `npm run e2e -- --update-snapshots=all`.

## Inside a feature

`features/game/` shows the pattern:

- `model/`: pure functions and the session reducer. They turn engine state into exactly what each part of the screen shows (`boardView`, `playerStatus`, `feedbackFor`, `entryView`). Unit-tested without a browser.
- `components/`: render what the model hands them. No rules, no copy decisions.
- `useGame.ts`: the one hook joining the reducer to React. `useAiTurn.ts` runs the AI's turn (thinking, the word appearing, settling) on top of it.
- `GameScreen.tsx`: assembles the components and owns screen-only state (which sheet is open).
- `styles/`: the design's CSS for this feature, split from `design/handoff/design/wordrush.css`.

## Checking against the design

- `node scripts/shoot.mjs <url> <out.png> [width] [height] [dark|light]` screenshots the running app, or a design mockup served from `design/handoff/design`, at an exact device size.
- `node scripts/play-shots.mjs <url> <outDir>` plays a scripted game and screenshots each step.
- Both use Playwright with the installed Chrome (`channel: 'chrome'`).

## Commands (from `app/`)

- `npm run dev`: local dev server
- `npm test`: unit and conformance tests
- `npm run typecheck` and `npm run lint`
- `npm run copy`: regenerate `src/copy/deck.ts` after the copy deck changes
- `npm run deploy`: build and publish to Cloudflare by hand (a Worker serving the static `dist/`, configured in `wrangler.jsonc`). The live site is https://wordrush.wordrush-app.workers.dev
- Automatic deploys: `.github/workflows/deploy.yml` lints, tests, builds and deploys on every push to `main` (secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`). `develop` is where work is merged; push or merge it into `main` to release.
