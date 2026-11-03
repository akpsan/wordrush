# Dictionaries

Plain text word lists: one lowercase word per line, 3–5 letters, sorted.

The dictionary is an experiment variable. An everyday list keeps the game fast; a full Scrabble list makes it easier to escape tight spots. Record each list's source and licence here when you add it.

| File | What it's for | Source | Licence | Words |
| --- | --- | --- | --- | --- |
| `playable-3to5.txt` | **What counts as a word in the game.** The full list minus `blocked.txt`. | Generated | as below | 13,424 |
| `hints-3to5.txt` | Words hints may suggest: everyday words minus `blocked.txt`. | Generated | as below | 2,471 |
| `blocked.txt` | Offensive words that can't be played. | Words from [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words) found in the full list, plus their inflected forms and a few slurs it misses. | LDNOOBW: CC BY 4.0 | 87 |
| `enable-3to5.txt` | The full list, as used by the simulator. | [ENABLE word list](https://github.com/dolph/dictionary) (enable1.txt), 3–5 letters, a–z only | Public domain | 13,511 |
| `everyday-3to5.txt` | Common words; the simulator's default list. | Words in both ENABLE and [google-10000-english](https://github.com/first20hours/google-10000-english) (no-swears list), 3–5 letters | ENABLE: public domain. Google list: LDC licence and MIT (Norvig), research and personal use | 2,472 |

**Why two lists in the game:** players type their own words, so the game must accept any real word (the everyday list alone rejected words like HUG, OWL, NAP and CRAB). Hints come from the everyday list so they never suggest an obscure word. Simulated fairness with the full list under the current rules: Blue wins 53–55% (`sim/reports/dictionary_current.md`).

**To change what's blocked:** edit `blocked.txt`, then regenerate the two derived lists:

```bash
cd data/dictionaries
grep -vxFf blocked.txt enable-3to5.txt > playable-3to5.txt
grep -vxFf blocked.txt everyday-3to5.txt > hints-3to5.txt
```
