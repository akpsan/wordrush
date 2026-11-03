# App architecture

The web app lives in `app/` (Vite, React, TypeScript). It's built in layers. Each layer may only depend on the ones below it.

```
app/src/
├── engine/       Rules of the game. Pure TypeScript: no React, no browser APIs, immutable state.
├── dictionary/   Loads the bundled word list (data/dictionaries/, shared with the simulator).
├── copy/         Every player-facing string. deck.ts is generated from the copy deck (npm run copy);
│                 overrides.ts holds the few strings the deck doesn't map 1:1. No other file contains copy.
├── theme/        Design tokens (CSS variables) and global styles, from the handoff's wordrush.css.
├── ui/           Shared building blocks with no game knowledge: Frame, Sheet, Icon, RichText, controls.
├── platform/     Small adapters for the outside world: storage, keyboard input, media queries.
├── features/     One folder per feature: game, menu, tutorial, settings, hints.
│                 Each owns its components, hooks and state, and uses the engine only through engine/index.ts.
└── app/          Wires the features together (screens and navigation). Thin.
```

## Rules for keeping it modular

- **The engine is the only place rules live.** UI code never re-implements a rule. It asks the engine (`previewEntry`, `checkEntry`, `legalMoves`, `waysOut`, `play`).
- **A rule change is a config change.** Board size, word lengths and the first-word limit are in `engine/rules.ts`. A new rule gets a field there first.
- **Features don't import each other's internals.** They communicate through props, the app layer, or small public `index.ts` files.
- **Copy and tokens are data.** Changing wording or colors never touches logic.
- **Removing a feature** (for example hints) means deleting its folder and its one registration line in `app/`.

## Testing

- `engine/__tests__/conformance.test.ts` replays 1,350 simulator games. The TypeScript engine must make exactly the same decisions as the Python simulator. Regenerate the fixture with `sim/scripts/export_conformance.py` after a rule change.
- `engine/__tests__/engine.test.ts` pins the behaviors the design depends on: first moves, the tutorial script, check order, previews and ways out.
- UI states are checked with Playwright screenshots against the handoff mockups (`design/handoff/`), at phone and desktop sizes, in both themes (to be added with the screens).

## Inside a feature

`features/game/` shows the pattern:

- `model/`: pure functions and the session reducer. They turn engine state into exactly what each part of the screen shows (`boardView`, `playerStatus`, `feedbackFor`, `entryView`). Unit-tested without a browser.
- `components/`: render what the model hands them. No rules, no copy decisions.
- `useGame.ts`: the one hook joining the reducer to React.
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
