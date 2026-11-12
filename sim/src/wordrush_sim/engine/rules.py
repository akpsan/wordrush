"""Rule flags. Every rule variant is a field here, never a branch elsewhere."""

from __future__ import annotations

from dataclasses import asdict, dataclass, replace


@dataclass(frozen=True)
class Rules:
    n: int = 8
    board: str = "square"
    """'square' or 'hex' (a hexagon of radius n // 2 in an n x n array; n must be odd). See geometry.py."""
    """Grid is n x n."""

    anchor: str = "start"
    """'start': a new word must start on a letter of your last word.
    'start_or_end': it may start or end on that letter."""

    opening: str = "anywhere"
    """'anywhere': first word goes anywhere in empty cells.
    'corners': A's first word starts in the top-left corner, B's ends in the bottom-right."""

    crossing: bool = False
    """A word may pass through any occupied cell whose letter matches."""

    min_new_cells: int = 1
    """A placement must add at least this many new cells."""

    stuck: str = "end"
    """'end': a stuck player ends the game.
    'pass': a stuck player passes; the game ends after two passes in a row.
    'revive': chain from any of your words; pass only if none works.
    'lose': a stuck player loses the game at once (Tron-style)."""

    timeout_ban: bool = False
    """A word removed by a timeout can't be played again by anyone."""

    zero_words_loss: bool = False
    """A timeout that leaves you with no words on the board loses the game."""

    b_bonus: float = 0
    """Points added to B's score (first-player compensation). A value ending in .5 makes ties impossible."""

    tie_break: str = "words"
    """Equal scores: 'words' = fewer timeouts, then fewer words played; 'b' = B wins."""

    a_first_max_len: int = 5
    """Maximum length of A's first word (first-player compensation)."""

    min_len: int = 3
    max_len: int = 5
    max_plies: int = 400
    """Safety cap on turns."""

    def with_(self, **changes) -> "Rules":
        return replace(self, **changes)

    def to_dict(self) -> dict:
        return asdict(self)


# The ladder from docs/rules.md. Each step adds one group of changes.
V1 = Rules()
V2 = V1.with_(stuck="pass")
V3 = V2.with_(anchor="start_or_end")
V4 = V3.with_(opening="corners")
V5 = V4.with_(crossing=True)
V6 = V5.with_(stuck="revive", timeout_ban=True)
V7 = V6.with_(min_new_cells=2, zero_words_loss=True)
"""Rules v2 as written in docs/rules.md, including the zero-words loss."""

V8 = V4.with_(a_first_max_len=4, b_bonus=0.5)
"""Rules v3 (decided 2026-11-03): V7 without revive (stuck player passes), without
crossing, and without the timer, so no timeout rules. Without crossing every word
adds at least 2 cells, so the 2-cell minimum is redundant, which leaves V4. Then the
first-player fix: A's first word has at most 4 letters, and B starts with +0.5."""

V9 = V4.with_(stuck="lose", a_first_max_len=4, tie_break="b")
"""Rules v4, the current rules (decided 2026-11-03): no revive, no crossing, no timer,
a cornered player loses, and A's first word has at most 4 letters. If the board fills
(never seen in simulation), more cells wins and B wins a tie. B's +0.5 from v3 was
dropped because it never mattered under "cornered loses"."""

CURRENT = V9

HEX1 = V9.with_(board="hex", n=9)
"""Hex mode prototype (2026-11-12): Rules v4 on a hexagon of radius 4 (61 cells), with a third
line direction, down-left. Words read left to right or downwards."""

HEX = HEX1.with_(n=11, a_first_max_len=3)
"""Hex mode, adopted 2026-11-12 (experiments/hex.py): a hexagon of radius 5 (91 cells), and A's first
word at most 3 letters. The fairest hex variant tested: A wins 52% (balanced bots) and 44% (aggressive)."""

PRESETS = {"V1": V1, "V2": V2, "V3": V3, "V4": V4, "V5": V5, "V6": V6, "V7": V7, "V8": V8, "V9": V9, "HEX1": HEX1, "HEX": HEX}
