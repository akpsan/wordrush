"""Bots. Each one picks a move from the legal moves of a state.

Skill tiers, weakest first: random, greedy, then three one-ply evaluators with
different styles (defensive, aggressive, balanced), then a two-ply search bot.
"""

from __future__ import annotations

import math
import random

from ..engine import STUCK, State, apply, legal_moves

WIN = 1_000_000


class Agent:
    name = "agent"

    def choose(self, state: State, moves: list, rng: random.Random):
        raise NotImplementedError


class RandomAgent(Agent):
    name = "random"

    def choose(self, state, moves, rng):
        return rng.choice(moves)


class GreedyAgent(Agent):
    """Most new cells now; no thought about the future."""

    name = "greedy"

    def choose(self, state, moves, rng):
        best = max(m.new for m in moves)
        return rng.choice([m for m in moves if m.new == best])


def mobility(state: State, player: int) -> int | None:
    """Legal moves `player` would have on this board. None before their first word."""
    if not state.chains[player]:
        return None
    return len(legal_moves(state, player))


def evaluate(state: State, me: int, w_own: float, w_opp: float) -> float:
    """Score a position from `me`'s point of view, with the opponent to move."""
    if state.over:
        return _outcome(state, me)
    opp = 1 - me
    diff = state.score(me) - state.score(opp)
    own = mobility(state, me)
    their = mobility(state, opp)
    if state.rules.stuck == "lose":
        # Exact: the opponent moves next. If they have no move, they lose now.
        # If I have none, nothing they do can free me (cells never empty), so I lose.
        if their == 0:
            return WIN
        if own == 0:
            return -WIN
        return _survival_value(diff, own, their, w_own, w_opp)
    if state.rules.stuck == "end":
        # The game ends the moment someone is stuck at the start of their turn.
        if their == 0:
            return WIN * _sign(diff) / 10 + diff
        if own == 0:
            # Opponent gets one more move (about 4 cells), then I am stuck.
            return WIN * _sign(diff - 4) / 10 + diff
    value = float(diff)
    if own is not None:
        value += w_own * math.log1p(own) - (3 if own == 0 else 0)
    if their is not None:
        value -= w_opp * math.log1p(their)
    return value


def _survival_value(diff, own, their, w_own, w_opp) -> float:
    """When getting stuck loses, cells only matter if the board fills, so they get a
    small weight. Mobility on both sides is what matters. Every style keeps a minimum
    weight on both, because ignoring either side is suicidal under this rule."""
    value = 0.1 * diff
    if own is not None:
        value += max(w_own, 1.0) * math.log1p(own)
    if their is not None:
        value -= max(w_opp, 1.0) * math.log1p(their)
    return value


def _sign(x: float) -> int:
    return (x > 0) - (x < 0)


def _outcome(state: State, me: int) -> float:
    if state.winner is None:
        return 0.0
    return WIN if state.winner == me else -WIN


class EvalAgent(Agent):
    """One-ply: try each candidate, score the resulting position."""

    def __init__(self, name: str, w_own: float, w_opp: float, cap: int = 60):
        self.name = name
        self.w_own = w_own
        self.w_opp = w_opp
        self.cap = cap

    def ranked(self, state, moves, rng, cap=None):
        me = state.to_move
        scored = []
        for m in candidates(state, moves, rng, cap or self.cap):
            scored.append((evaluate(apply(state, m), me, self.w_own, self.w_opp), rng.random(), m))
        scored.sort(key=lambda t: (t[0], t[1]), reverse=True)
        return scored

    def choose(self, state, moves, rng):
        return self.ranked(state, moves, rng)[0][2]


class LookaheadAgent(EvalAgent):
    """Two-ply: for the best few moves, assume the opponent's best reply."""

    def __init__(self, name="lookahead", top_k=6, reply_cap=30, w_own=2.0, w_opp=2.0):
        super().__init__(name, w_own, w_opp)
        self.top_k = top_k
        self.reply_cap = reply_cap

    def choose(self, state, moves, rng):
        me = state.to_move
        best, best_value = None, -math.inf
        for first_value, _, m in self.ranked(state, moves, rng)[: self.top_k]:
            after = apply(state, m)
            if after.over:
                value = first_value
            else:
                replies = legal_moves(after)
                if replies:
                    reply = self.ranked(after, replies, rng, self.reply_cap)[0][2]
                else:
                    reply = STUCK
                final = apply(after, reply)
                value = (
                    _outcome(final, me)
                    if final.over
                    else evaluate_my_turn(final, me, self.w_own, self.w_opp)
                )
            if value > best_value:
                best, best_value = m, value
        return best


def evaluate_my_turn(state: State, me: int, w_own: float, w_opp: float) -> float:
    """Score a position where it is `me` to move."""
    opp = 1 - me
    diff = state.score(me) - state.score(opp)
    own = mobility(state, me)
    their = mobility(state, opp)
    if state.rules.stuck == "lose":
        if own == 0:
            return -WIN
        if their == 0:
            return WIN  # I move, and no move of mine can free them
        return _survival_value(diff, own, their, w_own, w_opp)
    if own == 0 and state.rules.stuck == "end":
        return WIN * _sign(diff) / 10 + diff
    value = float(diff)
    if own is not None:
        value += w_own * math.log1p(own) - (3 if own == 0 else 0)
    if their is not None:
        value -= w_opp * math.log1p(their)
    return value


def candidates(state: State, moves: list, rng: random.Random, cap: int) -> list:
    """Limit the moves a bot evaluates.

    Keeps the moves that add the most cells, a random sample of the rest, and,
    for open-board first words, moves next to existing letters (so a bot can
    find a blocking "wall" placement).
    """
    if len(moves) <= cap:
        return moves
    third = cap // 3
    by_gain = sorted(moves, key=lambda m: m.new, reverse=True)
    picked = {m.key: m for m in by_gain[:third]}
    near = _near_moves(state, moves)
    if near:
        for m in rng.sample(near, min(third, len(near))):
            picked[m.key] = m
    while len(picked) < cap:
        m = moves[rng.randrange(len(moves))]
        picked[m.key] = m
    return list(picked.values())


def _near_moves(state: State, moves: list) -> list:
    if state.chains[state.to_move]:
        return []  # chained moves are already next to letters
    n = state.n
    occupied = [i for i, ch in enumerate(state.letters) if ch]
    if not occupied:
        return []
    near = set()
    for i in occupied:
        r, c = divmod(i, n)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            if 0 <= rr < n and 0 <= cc < n:
                near.add(rr * n + cc)
    out = []
    for m in moves:
        step = 1 if m.dir == 0 else n
        if any(m.start + k * step in near for k in range(len(m.word))):
            out.append(m)
    return out


AGENTS = {
    "random": lambda: RandomAgent(),
    "greedy": lambda: GreedyAgent(),
    "defensive": lambda: EvalAgent("defensive", w_own=3.0, w_opp=0.0),
    "aggressive": lambda: EvalAgent("aggressive", w_own=0.0, w_opp=3.0),
    "balanced": lambda: EvalAgent("balanced", w_own=2.0, w_opp=2.0),
    "lookahead": lambda: LookaheadAgent(),
}
"""Ordered weakest to strongest (roughly; the experiments check)."""


def make_agent(name: str) -> Agent:
    return AGENTS[name]()
