"""Game state, moves and the two pure functions: legal_moves and apply.

Cells are indexed r * n + c. Directions: H (left to right), V (top to bottom) and, on hex
boards, D (down-left). See geometry.py.
Players: 0 is A (moves first), 1 is B.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import NamedTuple

from .geometry import geometry, ray, step
from .lexicon import END, Lexicon
from .rules import Rules

H, V, D = 0, 1, 2
DIR_NAMES = "HVDhvd"
"""Lowercase: the same line read backwards (Rules.two_way, hex only)."""
VOID = "#"
"""Letter of an off-board cell (hex boards): it blocks words like any letter, and is never anyone's."""


class Move(NamedTuple):
    word: str
    start: int
    dir: int
    new: int = 0
    """Number of empty cells this placement fills (filled in by legal_moves)."""

    @property
    def key(self):
        return (self.word, self.start, self.dir)


STUCK = "STUCK"
"""Played when a player has no legal move. What it does depends on Rules.stuck."""

TIMEOUT = "TIMEOUT"
"""Injected by the runner to test timeout mechanics. Bots never choose it."""


class Placement(NamedTuple):
    word: str
    cells: tuple
    player: int


@dataclass
class State:
    rules: Rules
    lex: Lexicon
    letters: list
    owner: list
    users: list
    placements: dict = field(default_factory=dict)
    chains: list = field(default_factory=lambda: [[], []])
    on_board: dict = field(default_factory=dict)
    banned: frozenset = frozenset()
    to_move: int = 0
    passes_in_row: int = 0
    cells_owned: list = field(default_factory=lambda: [0, 0])
    words_played: list = field(default_factory=lambda: [0, 0])
    timeouts: list = field(default_factory=lambda: [0, 0])
    ply: int = 0
    next_id: int = 0
    over: bool = False
    winner: int | None = None
    reason: str = ""

    @property
    def n(self) -> int:
        return self.rules.n

    def copy(self) -> "State":
        return State(
            rules=self.rules,
            lex=self.lex,
            letters=self.letters[:],
            owner=self.owner[:],
            users=self.users[:],
            placements=dict(self.placements),
            chains=[self.chains[0][:], self.chains[1][:]],
            on_board=dict(self.on_board),
            banned=self.banned,
            to_move=self.to_move,
            passes_in_row=self.passes_in_row,
            cells_owned=self.cells_owned[:],
            words_played=self.words_played[:],
            timeouts=self.timeouts[:],
            ply=self.ply,
            next_id=self.next_id,
            over=self.over,
            winner=self.winner,
            reason=self.reason,
        )

    def score(self, player: int) -> int:
        return self.cells_owned[player] + (self.rules.b_bonus if player == 1 else 0)

    def filled(self) -> int:
        return sum(1 for ch in self.letters if ch and ch != VOID)

    def render(self) -> str:
        """A's letters uppercase, B's lowercase, empty cells as dots."""
        n = self.n
        rows = []
        for r in range(n):
            row = []
            for c in range(n):
                i = r * n + c
                ch = self.letters[i]
                row.append(" " if ch == VOID else "." if not ch else ch.upper() if self.owner[i] == 0 else ch)
            rows.append(" ".join(row))
        return "\n".join(rows)


def new_game(rules: Rules, lex: Lexicon) -> State:
    size = rules.n * rules.n
    g = geometry(rules.board, rules.n, rules.two_way)
    letters = ["" if ok else VOID for ok in g.valid]
    return State(rules=rules, lex=lex, letters=letters, owner=[-1] * size, users=[0] * size)


def cells_of(n: int, word_len: int, start: int, d: int) -> tuple:
    s = step(n, d)
    return tuple(start + k * s for k in range(word_len))


# ---------------------------------------------------------------------------
# Legal moves


def legal_moves(state: State, player: int | None = None) -> list:
    """All legal placements for `player` (default: the player to move).

    An empty list means the player is stuck and must play STUCK.
    """
    if state.over:
        return []
    p = state.to_move if player is None else player
    chain = state.chains[p]
    if not chain:
        return _opening_moves(state, p)
    moves = _chain_moves(state, [state.placements[chain[-1]]])
    if not moves and state.rules.stuck == "revive" and len(chain) > 1:
        moves = _chain_moves(state, [state.placements[i] for i in chain[:-1]])
    return moves


def _usable(state: State, word: str) -> bool:
    return word not in state.on_board and word not in state.banned


def _chain_moves(state: State, sources: list) -> list:
    rules, lex, n = state.rules, state.lex, state.n
    letters = state.letters
    crossing = rules.crossing
    min_new = rules.min_new_cells
    lo, hi = rules.min_len, rules.max_len
    both_ends = rules.anchor == "start_or_end"
    found: dict = {}

    g = geometry(rules.board, n, rules.two_way)
    dirs = range(len(g.dirs))
    for placement in sources:
        for anchor in placement.cells:
            ch = letters[anchor]
            for d in dirs:
                fwd_node = lex.forward.get(ch)
                if fwd_node is not None:
                    path = ray(g, anchor, d, 1, hi)
                    out: list = []
                    _walk(fwd_node, path, 1, 0, letters, crossing, lo, hi, out)
                    for word, new in out:
                        if new >= min_new and _usable(state, word):
                            m = Move(word, anchor, d, new)
                            found[m.key] = m
                if both_ends:
                    rev_node = lex.reverse.get(ch)
                    if rev_node is not None:
                        path = ray(g, anchor, d, -1, hi)
                        out = []
                        _walk(rev_node, path, 1, 0, letters, crossing, lo, hi, out)
                        for word, new in out:
                            if new >= min_new and _usable(state, word):
                                start = anchor - (len(word) - 1) * step(n, d)
                                m = Move(word, start, d, new)
                                found[m.key] = m
    return list(found.values())


def _walk(node, path, depth, new, letters, crossing, lo, hi, out) -> None:
    """Extend a trie prefix of length `depth` along `path`, collecting fitting words."""
    if depth >= lo and END in node:
        out.append((node[END], new))
    if depth >= hi or depth >= len(path):
        return
    ch = letters[path[depth]]
    if not ch:
        for key, child in node.items():
            if key != END:
                _walk(child, path, depth + 1, new + 1, letters, crossing, lo, hi, out)
    elif crossing:
        child = node.get(ch)
        if child is not None:
            _walk(child, path, depth + 1, new, letters, crossing, lo, hi, out)


def _opening_moves(state: State, p: int) -> list:
    rules, lex, n = state.rules, state.lex, state.n
    max_len = rules.max_len
    if p == 0 and state.words_played[0] == 0:
        max_len = min(max_len, rules.a_first_max_len)
    first_word = state.words_played[p] == 0

    g = geometry(rules.board, n, rules.two_way)
    dirs = range(len(g.dirs))
    if rules.opening == "corners" and first_word:
        corner = g.a_corner if p == 0 else g.b_corner
        if not state.letters[corner]:
            moves = []
            for d in dirs:
                sign = 1 if p == 0 else -1
                path = ray(g, corner, d, sign, max_len)
                out: list = []
                trie = lex.forward if p == 0 else lex.reverse
                _walk(trie, path, 0, 0, state.letters, False, rules.min_len, max_len, out)
                for word, new in out:
                    if _usable(state, word):
                        start = corner if p == 0 else corner - (len(word) - 1) * step(n, d)
                        moves.append(Move(word, start, d, new))
            return moves

    # Anywhere: every run of empty cells, every word that fits it.
    letters = state.letters
    moves = []
    for start in range(n * n):
        if letters[start]:
            continue
        for d in dirs:
            path = ray(g, start, d, 1, max_len)
            run = 0
            while run < len(path) and not letters[path[run]]:
                run += 1
            for length in range(rules.min_len, run + 1):
                for word in lex.by_len.get(length, ()):
                    if _usable(state, word):
                        moves.append(Move(word, start, d, length))
    return moves


# ---------------------------------------------------------------------------
# Applying moves


def apply(state: State, move) -> State:
    """Return the state after `move`. The input state is not modified."""
    if state.over:
        raise ValueError("game is over")
    s = state.copy()
    p = s.to_move
    if move == STUCK:
        if s.rules.stuck == "end":
            _finish(s, "stuck")
            return s
        if s.rules.stuck == "lose":
            _finish(s, "cornered", winner=1 - p)
            return s
        s.passes_in_row += 1
        if s.passes_in_row >= 2:
            _finish(s, "both_passed")
            return s
    elif move == TIMEOUT:
        s.timeouts[p] += 1
        s.passes_in_row = 0
        if s.chains[p]:
            pid = s.chains[p].pop()
            word = _remove(s, pid)
            if s.rules.timeout_ban:
                s.banned = s.banned | {word}
        if not s.chains[p] and s.rules.zero_words_loss:
            _finish(s, "zero_words", winner=1 - p)
            return s
    else:
        _place(s, move, p)
        s.passes_in_row = 0
        if all(s.letters):  # off-board cells hold VOID, so this counts on-board cells only
            _finish(s, "full")
            return s
    s.ply += 1
    s.to_move = 1 - p
    if s.ply >= s.rules.max_plies:
        _finish(s, "cap")
    return s


def _place(s: State, move: Move, p: int) -> None:
    cells = cells_of(s.n, len(move.word), move.start, move.dir)
    for cell, ch in zip(cells, move.word):
        if not s.letters[cell]:
            s.letters[cell] = ch
            s.owner[cell] = p
            s.cells_owned[p] += 1
        elif s.letters[cell] != ch:
            raise ValueError(f"illegal move {move}: cell {cell} holds {s.letters[cell]!r}")
        s.users[cell] += 1
    pid = s.next_id
    s.next_id += 1
    s.placements[pid] = Placement(move.word, cells, p)
    s.chains[p].append(pid)
    s.on_board[move.word] = pid
    s.words_played[p] += 1


def _remove(s: State, pid: int) -> str:
    placement = s.placements.pop(pid)
    for cell in placement.cells:
        s.users[cell] -= 1
        if s.users[cell] == 0:
            s.cells_owned[s.owner[cell]] -= 1
            s.letters[cell] = ""
            s.owner[cell] = -1
    del s.on_board[placement.word]
    return placement.word


def _finish(s: State, reason: str, winner: int | None = -1) -> None:
    s.over = True
    s.reason = reason
    if winner != -1:
        s.winner = winner
        return
    a, b = s.score(0), s.score(1)
    if a != b:
        s.winner = 0 if a > b else 1
    elif s.rules.tie_break == "b":
        s.winner = 1
    elif s.timeouts[0] != s.timeouts[1]:
        s.winner = 0 if s.timeouts[0] < s.timeouts[1] else 1
    elif s.words_played[0] != s.words_played[1]:
        s.winner = 0 if s.words_played[0] < s.words_played[1] else 1
    else:
        s.winner = None


# ---------------------------------------------------------------------------
# Move notation for records: "word@r,c,H", "STUCK", "TIMEOUT"


def encode(move, n: int) -> str:
    if move in (STUCK, TIMEOUT):
        return move
    r, c = divmod(move.start, n)
    return f"{move.word}@{r},{c},{DIR_NAMES[move.dir]}"


def decode(text: str, n: int):
    if text in (STUCK, TIMEOUT):
        return text
    word, pos = text.split("@")
    r, c, d = pos.split(",")
    return Move(word, int(r) * n + int(c), DIR_NAMES.index(d))
