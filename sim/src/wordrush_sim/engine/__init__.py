"""Rules as pure functions: game state, moves, legal-move generation, rule flags."""

from .game import (
    STUCK,
    TIMEOUT,
    H,
    Move,
    State,
    V,
    apply,
    decode,
    encode,
    legal_moves,
    new_game,
)
from .lexicon import Lexicon, get_lexicon
from .rules import PRESETS, Rules

__all__ = [
    "H", "V", "Move", "State", "STUCK", "TIMEOUT", "apply", "decode", "encode",
    "legal_moves", "new_game", "Lexicon", "get_lexicon", "PRESETS", "Rules",
]
