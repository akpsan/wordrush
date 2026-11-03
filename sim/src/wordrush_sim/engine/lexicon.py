"""Word lists indexed for fast legal-move generation."""

from __future__ import annotations

from pathlib import Path

END = "$"
"""Trie key marking a complete word; its value is the word."""

DICT_DIR = Path(__file__).resolve().parents[4] / "data" / "dictionaries"


class Lexicon:
    def __init__(self, words, name: str = "custom"):
        self.name = name
        self.words = frozenset(w.strip().lower() for w in words if w.strip())
        self.by_len: dict[int, list[str]] = {}
        self.forward: dict = {}
        self.reverse: dict = {}
        for w in sorted(self.words):
            self.by_len.setdefault(len(w), []).append(w)
            _insert(self.forward, w, w)
            _insert(self.reverse, w[::-1], w)

    @classmethod
    def load(cls, name: str) -> "Lexicon":
        path = DICT_DIR / f"{name}.txt"
        return cls(path.read_text().split(), name=name)


def _insert(root: dict, key: str, word: str) -> None:
    node = root
    for ch in key:
        node = node.setdefault(ch, {})
    node[END] = word


_CACHE: dict[str, Lexicon] = {}


def get_lexicon(name: str) -> Lexicon:
    if name not in _CACHE:
        _CACHE[name] = Lexicon.load(name)
    return _CACHE[name]
