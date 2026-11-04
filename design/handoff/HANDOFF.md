# WordRush: design handoff for Claude Code

This folder is the complete WordRush design: every screen as HTML, the shared styles, the copy deck and the glossary. Use it as the source of truth when building the app.

## What's in here

| Path | What it is |
|---|---|
| `design/Main.dc.html` | The game screen. Its `<script>` block holds working logic you can port: the placement engine (`fits`), the "ways out" count (`exitsOn`), the feedback-line rules, the error checks and the sample games. |
| `design/Tutorial.dc.html` | Learn to play: a 9-step scripted tutorial on the real board and keyboard. |
| `design/Menu.dc.html` | Main menu (Play vs AI, Play a friend, Continue, Learn to play), settings, and the Play vs AI setup sheet. |
| `design/vc-*.dc.html`, `menu-4…6-*` | Play vs AI: setup, the AI's turn (thinking → word appearing → your turn), danger, results, desktop. The AI personas are Pip (Easy), Juno (Medium) and Rex (Hard). |
| `design/wordrush.css` | Design tokens and styles: light/dark themes, player colours, cell states, keyboard, sheets. Port the CSS variables as your theme. |
| `design/Legend.dc.html` | Every cell state and the danger meter, with the non-colour cue for each. |
| `design/Glossary.dc.html` | Player-facing words (also in the copy deck). |
| `design/*.dc.html` (others) | One file per state. Each one embeds `Main`, `Tutorial` or `Menu` with a `scene`/`step`/`variant` prop, so you can see exactly which state it shows. |
| `design/canvas.json` | Canvas layout plus the **dev notes** (sticky notes) in `notes`. Read the notes: they cover behaviour, timing, edge cases and accessibility for every screen. |
| `wordrush-copy-deck.md` | Every string in the game with an ID, screen, purpose and final text. Use the text exactly as written. |

## Viewing the screens in a browser

`design/support.js` is the design runtime: it bundles React and renders the `.dc.html` format. It loads each page over HTTP, so double-clicking a file (`file://`) won't work. Serve the folder instead:

```bash
cd wordrush-handoff/design
python3 -m http.server 8000      # or: npx serve .
```

Then open http://localhost:8000/ for an index of every screen. Every screen is interactive: tap keys, Flip, Play, step through the tutorial. Fonts load from Google Fonts, so you need to be online for the exact typefaces (it falls back to system fonts offline).

The `.dc.html` files are a design-tool format: markup in `<x-dc>`, `{{holes}}` filled by `renderVals()` in the script, `<sc-for>` / `<sc-if>` for loops and branches. Treat them as a precise reference, not as code to ship.

## Rules in brief

- 8×8 board, 2 players (Blue goes first, Orange second). Two modes: Play a friend (pass and play on one device) and Play vs AI (the AI plays real words under the same rules and can be boxed in). No timer.
- Words are 3–5 letters, read left to right or top to bottom, and each word can only be played once.
- Blue's first word starts in the top-left corner and is 4 letters max. Orange's first word ends in the bottom-right corner.
- Every later word must start or end on a letter of your own last word. That shared letter belongs to both words.
- Every other cell of a new word must be empty: every letter on the board blocks new words.
- If no word fits off your last word at the start of your turn, you're boxed in and you lose (checked automatically).
- Full board (rare): more squares wins, and a tie goes to Orange.

## Interaction model

- **Word first.** The player types on an on-screen keyboard, and on desktop the physical keyboard types too. Placements are recomputed on every key press.
- **Preview.** The preview shows the first placement:
  - dotted grey while the word is still partial
  - dashed, in the player's colour, once it's a real word that fits
- **Flip.** The Flip key, a tap on the preview, or Tab/Space on desktop moves to the next placement.
- **Narrowing.** Tapping one of your glowing letters narrows the placements to just that letter.
- **Play.** The Play button or Enter plays the word.
  - When the word isn't ready, Play stays tappable (`aria-disabled`, not `disabled`), so tapping it explains why.
  - The explanation comes with a shake and one of the "oops" messages from the copy deck.

## Board clarity (decided)

Older words fade by age at rest (each player's last word full strength, the word before ~70%, older ~30%), and while typing everything except your last word and the preview dims. Game-over, boxed-in and replay boards stay at full contrast, and a "Show all letters" setting turns fading off. Details: the green `devFade` note in `canvas.json`. In `Main.dc.html` this is the `clarity` prop (default `fadeFocus`).

## Decisions

The open questions from the design notes are decided in `docs/ui-decisions.md` at the repo root, which takes precedence over the dev notes in `canvas.json`. In short: the "ways out" meter counts real words; tutorial step 7 uses CAT instead of OPEN and step 8 uses DOGS and PLANT (the copy deck is updated, the `Tutorial.dc.html` mockup still shows the old words); hints default to Off; older letters fade to 45%, not 30%.

The leftover state files from earlier design rounds (timeouts, passing, suggestion cards) were removed; `design/index.html` lists only the current screens.

## Suggested build order

1. Engine (pure TypeScript, unit-tested):
   - board model where each cell knows its owner and the words that use it
   - placement finder
   - word validation against a bundled word list
   - "ways out" count and the boxed-in check
   - game-over rules
2. Game screen, with every state on the canvas.
3. Menu and settings, with a saved game for Continue.
4. Learn to play, driven by the same engine with a scripted step list.
5. Play vs AI: move picker per difficulty, the AI's turn timing and animation, setup sheet, records per opponent (see the "vs AI" dev notes in canvas.json).
6. Desktop layout (≥1080px, three columns) and the keyboard shortcuts.
