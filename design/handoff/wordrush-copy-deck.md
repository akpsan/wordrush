# WordRush copy deck

Every player-facing string in the WordRush mockups, in one place. Use the **Final text** column as-is when building the app.

- `{curly}` = a value filled in at runtime. `{WORD}` is always uppercase. `{letters}` is the letters of the player's last word, written "S, T, A or R".
- **Bold** inside a string marks the part shown in bold on screen (usually the word or the letters).
- Strings marked *(not in mockups)* are needed for the build but have no artboard yet.

## Voice in one line

A fun friend explaining the game: short sentences, everyday words, "you" for the player, "your opponent" (or Blue / Orange) for the other player. Never: dictionary, invalid, error, legal, placement, anchor, exit, cornered, gap, cell, resign. Full term list: see the Glossary at the end.

---

## 1. Main menu

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| menu.logo | Menu | Game name | WORDRUSH |
| menu.tagline | Menu | Sells the idea in one line | Chain words. **Don't get boxed in.** |
| menu.settings.aria | Menu | Gear button label (screen readers) | Settings |
| menu.learn.title | Menu | Tutorial button | Learn to play |
| menu.learn.sub | Menu · first launch | Under the tutorial button | A quick game with tips. Under 2 minutes! |
| menu.learn.pill.first | Menu · first launch | Tag on the tutorial button | New? Start here |
| menu.learn.pill.returning | Menu · returning | Tag on the small tutorial row | 2 min |
| menu.cpu.title | Menu | Play vs AI (one tap with last settings, or opens setup the first time) | Play vs AI |
| menu.cpu.sub.first | Menu · first launch | Under the button, no settings saved yet | Pick from 3 opponents, easy to hard |
| menu.cpu.sub.last | Menu · returning | Last settings, shown so one tap is enough | {ai} · {level} · {whoFirst} |
| menu.cpu.sub.last.example | Menu · returning | Example | Juno · Medium · you go first |
| menu.cpu.whoFirst.you / ai / random | Menu · returning | Values for {whoFirst} | you go first · {ai} goes first · random start |
| menu.cpu.change | Menu · returning | Square button next to Play the computer | Change |
| menu.cpu.change.aria | Menu · returning | Screen readers | Change AI opponent |
| menu.friend.title | Menu | Pass and play | Play a friend |
| menu.friend.sub | Menu | What Play a friend means | 2 players, 1 device: take turns |
| menu.continue.title | Menu · returning | Resume a saved game | Continue |
| menu.continue.sub.friend | Menu · returning | Saved pass-and-play game | vs a friend · Turn {n} · {player}'s move |
| menu.continue.sub.cpu | Menu · returning | Saved vs-AI game | vs {ai} ({level}) · Turn {n} · {yourMoveOrTheirs} |
| menu.continue.sub.cpu.example | Menu · returning | Example | vs Juno (Medium) · Turn 9 · your move |
| menu.continue.cpu.turn.you / ai | Menu · returning | Values for {yourMoveOrTheirs} | your move · {ai}'s move |
| ~~menu.footer~~ | Menu | Dropped: both modes are on the menu now | (removed) |
| menu.abandon.title | Menu *(not in mockups)* | Confirm when starting a new game over a saved one | Start a new game? |
| menu.abandon.body | Menu *(not in mockups)* | Explains what happens | Your game in progress will end. |
| menu.abandon.keep | Menu *(not in mockups)* | Cancel | Keep playing |
| menu.abandon.confirm | Menu *(not in mockups)* | Confirm | New game |

### Settings (menu)

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| settings.title | Settings sheet | Sheet title | Settings |
| settings.theme.label | Settings sheet | Row label | Theme |
| settings.theme.help | Settings sheet | Row help | Matches your device unless you pick one. |
| settings.theme.auto / light / dark | Settings sheet | Options | Auto · Light · Dark |
| settings.hints.label | Settings sheet | Row label | Hints per game |
| settings.hints.help | Settings sheet | Row help | A hint shows one letter of a word that fits. You both get the same number. |
| settings.hints.options | Settings sheet | Options | Off · 1 · 3 |
| settings.highlight.label | Settings sheet | Row label | Highlight your letters |
| settings.highlight.help | Settings sheet | Row help | Marks your letters on the keyboard. |
| settings.highlight.aria | Settings sheet | Toggle label | Highlight your letters: {on/off} |
| settings.showall.label | Settings sheet | Row label (default off) | Show all letters |
| settings.showall.help | Settings sheet | Row help | Older words fade so your last word stands out. Turn this on to keep every letter at full strength. |
| settings.showall.aria | Settings sheet | Toggle label | Show all letters: {on/off} |
| settings.done | Settings sheet | Close | Done |

---

## 2. Game screen

### Header and status bar

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| game.menu.aria | Header | Menu button | Menu and settings |
| game.giveup.aria | Header | Flag button | Give up |
| game.help.aria | Header | ? button | How to play |
| player.blue | Status bar | Player name | Blue |
| player.orange | Status bar | Player name | Orange |
| player.you | Status bar | Tag next to the local player | You |
| ways.many | Status bar | Room left, 2 or more (n is 2 or 3+) | {n} words to play |
| ways.one | Status bar | Room left, running out | 1 word left! |
| ways.none | Status bar | No room | Boxed in |
| ways.unknown | Status bar | Not checked (game over / before first word) | — |
| squares.count | Status bar | Secondary count | {n} squares |
| squares.delta | Status bar | Floats up after a play | +{n} |
| turn.label | Status bar | Above the number | TURN |
| turn.over | Status bar | Game over, in place of the turn | GAME · END |
| turn.aria | Status bar | Screen readers | Turn {n}, {player} to move |
| ways.aria | Status bar | Screen readers | {player}: {waysOut} |

### Typing, preview and playing (the feedback line under the entry tiles)

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| first.note | First move (Blue) | Small note above the entry tiles | First word: {n} letters max, starting in the corner |
| first.start.blue | First move (Blue) | Before typing | Start in the **top-left corner** |
| first.start.orange | First move (Orange) | Before typing | End your word in the **bottom-right corner** |
| first.keepgoing | First move | Typing, nothing fits yet | Keep going |
| type.start | Your turn | Before typing | Start or end with **{letters}** |
| type.start.afterOpp | Your turn | Before typing, right after the opponent's move | {opponent} played {WORD}. Start or end with **{letters}** |
| type.danger | Your turn, 1 way out | Before typing, light urgency | You're down to **1 word.** Follow the dots! |
| type.partial | Typing | Letters so far fit somewhere | **{n} spots** so far |
| type.partial.one | Typing | Same, singular | **1 spot** so far |
| type.nospot | Typing | Nothing fits yet (calm, grey) | No spot yet. Start or end with **{letters}** |
| type.ready.one | Ready | Real word, one spot | **{WORD}** fits! |
| type.ready.many | Ready | Real word, more spots | **{WORD}** fits! Flip for {n} more spots |
| type.ready.two | Ready | Same, one more spot | **{WORD}** fits! Flip for 1 more spot |
| btn.flip | Action row | Try the next spot | Flip |
| btn.flip.count | Action row | Inside the Flip button | {i} of {n} |
| btn.flip.aria | Action row | Screen readers | Flip to the next spot, {i} of {n} |
| btn.play | Action row | Not ready yet (looks inactive, still explains on tap) | Play |
| btn.play.ready | Action row | Ready | Play {WORD} |
| key.delete.aria | Keyboard | Backspace key | Delete |
| key.letter.aria | Keyboard | One of your letters | {L}, one of your letters |
| desk.keys | Desktop | Keyboard help under the actions | Just type! **Enter** to play · **Space** for the next spot · **⌫** to delete |

### When a word doesn't work (shown after Play / Enter, with a shake)

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| oops.short | Game | Fewer than 3 letters | Words need at least **3 letters** |
| oops.played | Game | Word is already on the board | **{WORD}** has already been played. Try another? |
| oops.notword | Game | Not a word we know | Hmm, **{WORD}** isn't a word we know. Try another? |
| oops.noroom | Game | Starts or ends with one of your letters, but there's no space | No room for **{WORD}** here. Try a shorter word? |
| oops.notyourletter | Game | Doesn't start or end with one of your letters | Start or end with **{letters}** to fit it in. |

### Opponent's turn

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| wait.thinking | Opponent's turn | Replaces the entry tiles | {opponent} is thinking |
| wait.danger | Opponent's turn | Opponent is running out of room | {opponent} is down to 1 word |
| wait.youPlayed | Opponent's turn | Feedback line | You played **{WORD}** · +{n} squares |
| wait.theyPlayed | Opponent's turn | Feedback line (other device) | {player} played **{WORD}** |

### Hints

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| hint.button.aria | Action row | Bulb button | Get a hint, {n} left |
| hint.chip | Above the entry tiles | After using a hint | Hint {pattern} · {n} left |
| hint.chip.example | Above the entry tiles | Example | Hint F _ R · 2 left |
| hint.none.aria | Action row *(not in mockups)* | Bulb disabled | No hints left |

### Give up

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| giveup.title | Give-up sheet | Title | Give up this game? |
| giveup.body | Give-up sheet | Reassure, no pressure. {opponent} = Blue, Orange or the AI's name | {opponent} wins if you give up. No rush, there's no timer. And there's definitely a word that fits, or the game would already be over! |
| giveup.hint.title | Give-up sheet | Hint offer (only when hints are on) | Stuck? Try a hint |
| giveup.hint.body | Give-up sheet | Hint offer detail | Shows one letter of a word that fits. You have {n} left. |
| giveup.hint.button | Give-up sheet | Use a hint | Get a hint |
| giveup.keep | Give-up sheet | Cancel | Keep playing |
| giveup.confirm | Give-up sheet | Confirm | Give up |

### Game settings (in-game menu)

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| gsettings.title | Game settings sheet | Title | Game settings |
| gsettings.hints.* | Game settings sheet | Same as menu settings | (see settings.hints.*) |
| gsettings.highlight.* | Game settings sheet | Same as menu settings | (see settings.highlight.*) |
| gsettings.showall.* | Game settings sheet | Same as menu settings | (see settings.showall.*) |
| gsettings.waysout.label | Game settings sheet | Row label | Show ways out |
| gsettings.waysout.help | Game settings sheet | Row help | When you're running out of room, dots show where you can still go. |
| gsettings.done | Game settings sheet | Close | Done |

### Boxed in and game over

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| boxed.title | Boxed-in moment | Panel title | Boxed in |
| boxed.body | Boxed-in moment | Why it ended | **{WORD}** is boxed in. There's no room for a word from any of its letters. |
| boxed.key.inway | Boxed-in moment | Legend chip for blocking letters | In the way |
| boxed.key.toosmall | Boxed-in moment | Legend chip for spaces too small | Too small |
| boxed.continue | Boxed-in moment | Go to results | See results |
| over.lost.title | Game over · you lost | Kind headline | Orange boxed you in |
| over.lost.sub | Game over · you lost | Quick nudge to play again | {WORD} ran out of room on turn {n}. So close! Rematch? |
| over.won.title | Game over · you won *(not in mockups)* | Brief celebration | You boxed Orange in! |
| over.won.sub | Game over · you won *(not in mockups)* | Detail | {WORD} ran out of room on turn {n}. Nice one! |
| over.gaveup.title | Game over · you gave up | Headline | You gave up |
| over.gaveup.sub | Game over · you gave up | Nudge | Orange takes this one. Up for a rematch? |
| over.theygaveup.title | Game over · opponent gave up *(not in mockups)* | Headline | Orange gave up. You win! |
| over.full.title | Game over · full board | Headline | Orange wins the tie! |
| over.full.sub | Game over · full board | Explains the tie rule | The board filled up and nobody got boxed in. It's a tie on squares, and ties go to Orange because Blue went first. |
| over.full.win.title | Game over · full board, more squares *(not in mockups)* | Headline | {player} wins on squares! |
| over.stats.words | Game over | Stat label | Words played |
| over.stats.squares | Game over | Stat label | Squares |
| over.replay | Game over | Watch the game again | Watch replay |
| over.again | Game over | Rematch | Play again |

---

## 3. Learn to play

### Shared

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| learn.skip | Header | Skip button | Skip |
| learn.progress | Header | Step counter | {n} / 9 |
| learn.progress.aria | Header | Screen readers | Step {n} of 9 |
| learn.steer | Any typing step | Player typed something else (not a real word) | For now, try **{WORD}** · tap ⌫ to fix |
| learn.steer.real | Any typing step | Player typed a different real word | Nice word! For now, try **{WORD}** · tap ⌫ to fix |
| learn.keepgoing | Any typing step | On track, not finished | Keep going: **{WORD}** |
| learn.yourturn | Opponent steps | Continue button | Your turn |
| learn.oppPlays | Opponent steps | In place of the entry tiles | Your opponent plays {WORD}… |
| learn.flip / learn.play | Typing steps | Action buttons | Flip · Play / Play {WORD} |

### Steps

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| learn.1.tag | Step 1 | Coach label | How you win |
| learn.1.coach | Step 1 | Coach line | Grow your chain. Box in your opponent. Get boxed in and you lose. |
| learn.1.big | Step 1 | Headline | Don't get boxed in |
| learn.1.body | Step 1 | Intro | You grow from the top-left. Your opponent grows from the bottom-right. Whoever runs out of room first loses. This takes about 2 minutes. |
| learn.1.button | Step 1 | Start | Let's go |
| learn.2.tag | Step 2 | Coach label | Your first word |
| learn.2.coach | Step 2 | Coach line | Start in the top-left corner. Type **TEAM**! |
| learn.2.note | Step 2 | Above the entry tiles | First word: 4 letters max |
| learn.2.empty | Step 2 | Before typing | Tap the letters to spell **TEAM** |
| learn.2.ready | Step 2 | Ready | **TEAM** fits! Play it. |
| learn.3.tag | Step 3 | Coach label | Your opponent |
| learn.3.coach | Step 3 | Coach line | Your opponent starts in the opposite corner. |
| learn.4.tag | Step 4 | Coach label | Build off your last word |
| learn.4.coach | Step 4 | Coach line | Start or end on any letter of your last word. Type **MAP**. |
| learn.4.empty | Step 4 | Before typing | Your glowing letters are where you can build |
| learn.4.flip | Step 4 | MAP shows across first | Nice! Now tap **Flip** to send it down from the M. |
| learn.4.ready | Step 4 | Ready, after flipping | **MAP** fits! Play it. |
| learn.5.tag | Step 5 | Coach label | Your opponent |
| learn.5.coach | Step 5 | Coach line | They build off their last word too. **BIG** ends on the G of DOG. |
| learn.6.tag | Step 6 | Coach label | Ending works too |
| learn.6.coach | Step 6 | Coach line | Your word can also end on one of your letters. Type **TOP**. |
| learn.6.ready | Step 6 | Ready | **TOP** ends on your P. Play it! |
| learn.7.tag | Step 7 | Coach label | Letters get in the way |
| learn.7.coach | Step 7 | Coach line | Every letter blocks the way, even yours. Try **CAT**, ending on your T. |
| learn.7.bump.coach | Step 7 | After the bump | Your E is in the way, so CAT can't come down onto your T. |
| learn.7.bump.line | Step 7 | Feedback line, with shake | No room: your own **E** is in the way. |
| learn.7.button | Step 7 | Continue | Got it |
| learn.8.tag | Step 8 | Coach label | Box them in |
| learn.8.coach | Step 8 | Coach line | Your opponent's last word, DOGS, is up against the edge. Close off its last side with **PLANT**. |
| learn.8.meter.you | Step 8 | Your meter | Lots of room |
| learn.8.meter.them | Step 8 | Opponent's meter, before | {n} ways out |
| learn.8.ready | Step 8 | Ready | **PLANT** closes off DOGS from the left. Play it! |
| learn.8.won.tag | Step 8 | Coach label after the win | Boxed in! |
| learn.8.won.coach | Step 8 | Coach line after the win | DOGS has no room left: every gap is too small for a word. **You win!** |
| learn.8.won.meter | Step 8 | Opponent's meter, after | Boxed in |
| learn.8.won.line | Step 8 | Feedback line | You boxed in **Orange**! |
| learn.8.button | Step 8 | Continue | Finish |
| learn.9.tag | Step 9 | Coach label | All done |
| learn.9.coach | Step 9 | Coach line | That's the whole game. Now go box someone in! |
| learn.9.title | Step 9 | Headline | You're ready! |
| learn.9.recap.1 | Step 9 | Recap | Start or end on a letter of your last word |
| learn.9.recap.2 | Step 9 | Recap | Words need at least 3 letters |
| learn.9.recap.3 | Step 9 | Recap | Every letter blocks the way, even yours |
| learn.9.recap.4 | Step 9 | Recap | Get boxed in and you lose |
| learn.9.menu | Step 9 | Button | Back to menu |
| learn.9.play | Step 9 | Button, starts a game vs Pip (Easy), you go first | Play vs AI |
| learn.9.play.note | Step 9 | Under the buttons | Your first game is against Pip, the easy one. You can pick a tougher opponent anytime. |

### Skip

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| learn.skip.title | Skip sheet | Title | Skip the tutorial? |
| learn.skip.body | Skip sheet | Reassure | No problem! You can come back to it anytime from **Learn to play** on the menu. |
| learn.skip.keep | Skip sheet | Cancel | Keep learning |
| learn.skip.confirm | Skip sheet | Confirm | Skip |

---

## 5. Play vs AI (new)

Rows used only when one player is the AI. Everything else reuses sections 2 and 4: wherever a string says {opponent} or {player}, use the AI's name. `{ai}` is the persona name, `{level}` its difficulty. Never use he/she/it for the AI: repeat the name.

### AI opponents

| ID | Name | Level | Purpose | Final text (description in setup) |
|---|---|---|---|---|
| ai.easy | Pip | Easy | Persona | Pip plays short, everyday words and sometimes forgets to leave room. Great for warming up. |
| ai.medium | Juno | Medium | Persona | Juno plays solid words and always keeps a way out. |
| ai.hard | Rex | Hard | Persona | Rex plans ahead and tries to box you in. Good luck! |

### Setup sheet

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| cpu.setup.title | Setup sheet | Title | Play vs AI |
| cpu.setup.level.label | Setup sheet | Section label | Pick your opponent |
| cpu.setup.card | Setup sheet | Each opponent card | {ai} · {level} (e.g. Juno · Medium) |
| cpu.setup.card.aria | Setup sheet | Screen readers | {ai}, {level} |
| cpu.record | Setup sheet + results | Light record for that opponent | Wins vs {ai}: {n} |
| cpu.record.none | Setup sheet + results | No wins yet | No wins vs {ai} yet |
| cpu.setup.first.label | Setup sheet | Section label | Who goes first? |
| cpu.setup.first.you / ai / random | Setup sheet | Options | You · {ai} · Random |
| cpu.setup.first.you.help | Setup sheet | You selected | You'll be Blue. Blue always goes first, and Blue's first word is {n} letters max. |
| cpu.setup.first.ai.help | Setup sheet | AI selected | You'll be Orange. Blue always goes first, and Blue's first word is {n} letters max. |
| cpu.setup.first.random.help | Setup sheet | Random selected | We'll flip a coin. Blue always goes first, and Blue's first word is {n} letters max. |
| cpu.setup.hints.label | Setup sheet | Row label | Hints |
| cpu.setup.hints.help | Setup sheet | Row help | Same as your settings. Changing it here changes it there too. |
| cpu.setup.start | Setup sheet | Start | Start game |
| cpu.random.result.blue | Game, first line *(not in mockups)* | After a Random start | You're Blue this time. You go first! |
| cpu.random.result.orange | Game, first line *(not in mockups)* | After a Random start | You're Orange this time. {ai} goes first. |

### Game screen

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| cpu.card.name | Status bar | The AI's player card | {ai} |
| cpu.card.level | Status bar | Small tag on the AI's card | {level} |
| cpu.card.aria | Status bar | Screen readers | {ai}, {level}: {waysOut} |
| cpu.thinking | AI's turn | Replaces the entry tiles | {ai} is thinking |
| cpu.thinking.danger | AI's turn | When it's down to 1 way out | {ai} is down to 1 word |
| cpu.playing | AI's turn | While its letters appear | {ai} plays {WORD} |
| cpu.played | Your turn | Feedback line after its move | {ai} played {WORD}. Start or end with **{letters}** |
| cpu.danger.them | Your turn | The AI left itself 1 way out | {ai}'s down to **1 word.** Box {ai} in! |
| opp.danger.them | Your turn (pass and play) | Same, against a friend | {player}'s down to **1 word.** Box them in! |
| cpu.sr.thinking | Screen readers | Live region, AI's turn starts | {ai} is thinking. |
| cpu.sr.played | Screen readers | Live region, after its word lands | {ai} played {WORD}, going {across/down} from row {r}, column {c}. |
| cpu.sr.yourturn | Screen readers | Live region, your turn | Your turn. Start or end with {letters}. |
| cpu.giveup.body | Give-up sheet | Uses giveup.body with {opponent} | {ai} wins if you give up. No rush, there's no timer. And there's definitely a word that fits, or the game would already be over! |

### End of game

| ID | Screen | Purpose | Final text |
|---|---|---|---|
| cpu.over.won.title | Results · you won | Brief celebration | You boxed {ai} in! |
| cpu.over.won.sub | Results · you won | Detail | {WORD} ran out of room on turn {n}. Nice one! |
| cpu.over.lost.title | Results · you lost | Kind headline | {ai} boxed you in |
| cpu.over.lost.sub | Results · you lost | Nudge | {WORD} ran out of room on turn {n}. Rematch? |
| cpu.over.gaveup.title | Results · you gave up | Headline | You gave up |
| cpu.over.gaveup.sub | Results · you gave up | Nudge | {ai} takes this one. Rematch? |
| cpu.over.full.won | Results · full board *(not in mockups)* | You had more squares | You win on squares! |
| cpu.over.full.lost | Results · full board *(not in mockups)* | The AI had more, or won the tie | {ai} wins on squares |
| cpu.over.rematch | Results | Same opponent, same first-player choice | Rematch |
| cpu.over.change | Results | Opens the setup sheet | Change difficulty |
| cpu.over.menu | Results | Text button | Back to menu |

### Glossary addition

| Say | What it means | Example | Instead of |
|---|---|---|---|
| Pip, Juno, Rex | Your AI opponent, by name. The menu mode is "Play vs AI". | Juno played TOFU. | the computer, CPU, bot |

---

## 4. Glossary: player-facing words

Use these words everywhere a player reads. The last column lists words to keep out of player-facing text (they're fine in code and dev notes).

| Say | What it means | Example | Instead of |
|---|---|---|---|
| Your last word | The word you played most recently. Your next word builds off it. | Build off your last word. | latest word, most recent word |
| Your letters | The letters of your last word. They glow on the board and on the keyboard. | Start or end with S, T, A or R. | anchors, anchor letters |
| Link letter | The one letter your new word shares with your last word. | TOP ends on your P. | anchor cell, shared anchor |
| Spot | A place on the board where your word fits, across or down. | 2 more spots | placement, legal placement |
| Preview | Your word shown on the board before you play it. | A preview pops up as you type. | ghost |
| Flip | Try your word in its next spot. | Tap Flip to send it down. | rotate, cycle |
| Play | Put your word on the board for real. | Play RAT | place, commit, confirm |
| In the way | Every letter on the board blocks new words, yours and your opponent's. | Your own P is in the way. | wall, collision |
| Words to play | How many words you could play from your last word, shown as 1, 2 or 3+. (Changed 2026-11-12 from "ways out", the directions your word can grow.) | 1 word left! | room, danger level |
| Running out of room | Down to just 1 or 2 words. | JAIL is running out of room. | in danger, nearly cornered |
| Boxed in | No word fits off your last word. That player loses. | Orange boxed you in. | cornered, sealed, no way out |
| Squares | The 64 spaces on the board. They only decide a full-board finish. | 18 squares | cells, score |
| Hint | Shows one letter of a word that fits. | Stuck? Try a hint. | reveal, assist |
| Give up | End the game early. Your opponent wins. | Give up this game? | resign, forfeit |
| Your opponent | The other player. Use their name (Blue or Orange) when it's clearer. | Your opponent starts in the opposite corner. | player B, the enemy |
| Pip, Juno, Rex | Your AI opponent, by name (Easy, Medium, Hard). The menu mode is "Play vs AI". | Juno played TOFU. | the computer, CPU, bot |

**Say these early and often:** words need at least 3 letters, and your letter has to be the first or last letter of the new word.

**Never say to a player:** dictionary · invalid · error · legal · placement · anchor · exit · cornered · sealed · gap · cell · resign.
