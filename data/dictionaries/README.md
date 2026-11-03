# Dictionaries

Plain text word lists: one lowercase word per line, 3–5 letters, sorted.

The dictionary is an experiment variable. An everyday list keeps the game fast; a full Scrabble list makes it easier to escape tight spots. Record each list's source and licence here when you add it.

| File | Source | Licence | Words |
| --- | --- | --- | --- |
| `enable-3to5.txt` | [ENABLE word list](https://github.com/dolph/dictionary) (enable1.txt), 3–5 letters, a–z only | Public domain | 13,511 |
| `everyday-3to5.txt` | Words in both ENABLE and [google-10000-english](https://github.com/first20hours/google-10000-english) (no-swears list), 3–5 letters | ENABLE: public domain. Google list: LDC licence and MIT (Norvig), research and personal use | 2,472 |

The everyday list is the default. It still has a few odd entries that pass both filters (for example "sri", "gen"); they don't change results measurably but should be pruned before the list ships in the game.
