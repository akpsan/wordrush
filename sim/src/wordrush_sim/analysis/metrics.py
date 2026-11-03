"""Metrics computed from game records. All counting happens here, in code."""

from __future__ import annotations

import math
from collections import Counter, defaultdict
from statistics import mean

Z = 1.96


def wilson(k: int, n: int) -> tuple[float, float, float]:
    """Proportion with a 95% Wilson interval."""
    if n == 0:
        return (0.0, 0.0, 0.0)
    p = k / n
    denom = 1 + Z * Z / n
    centre = (p + Z * Z / (2 * n)) / denom
    half = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / denom
    return (p, max(0.0, centre - half), min(1.0, centre + half))


def mean_ci(xs: list) -> tuple[float, float]:
    """Mean and 95% half-width."""
    if not xs:
        return (0.0, 0.0)
    m = mean(xs)
    if len(xs) < 2:
        return (m, 0.0)
    var = sum((x - m) ** 2 for x in xs) / (len(xs) - 1)
    return (m, Z * math.sqrt(var / len(xs)))


def summarize(games: list, b_bonus: int = 0) -> dict:
    """Headline metrics for a group of games.

    Lead changes and comebacks use cells on the board, ignoring B's bonus, so a
    bonus doesn't make B "lead" before anyone has played. Lead changes are counted
    at the end of each round; counting every move would flip the lead constantly
    in close games, since every move gains a few cells.
    """
    n = len(games)
    a_wins = sum(1 for g in games if g["winner"] == 0)
    b_wins = sum(1 for g in games if g["winner"] == 1)
    draws = n - a_wins - b_wins
    words = [sum(g["words"]) / 2 for g in games]
    fill = [g["filled"] / g["cells"] for g in games]
    gap = [abs(g["scores"][0] - g["scores"][1]) for g in games]
    stuck = [sum(1 for p in g["plies"] if p[0] == "STUCK") for g in games]
    mobility = [p[1] for g in games for p in g["plies"] if p[1] is not None]
    reasons = Counter(g["reason"] for g in games)
    lead_changes, comebacks = [], 0
    for g in games:
        changes, leader = 0, 0
        for _, _, a, b in g["plies"][1::2]:  # end of each round, after B's move
            b -= b_bonus
            now = (a > b) - (a < b)
            if now and leader and now != leader:
                changes += 1
            if now:
                leader = now
        lead_changes.append(changes)
        if g["winner"] is not None and _trailed_at_halfway(g, b_bonus):
            comebacks += 1
    decisive = a_wins + b_wins
    return {
        "games": n,
        "words": mean_ci(words),
        "fill": mean_ci(fill),
        "a_win": wilson(a_wins, n),
        "b_win": wilson(b_wins, n),
        "draw": wilson(draws, n),
        "a_share": wilson(a_wins, decisive),
        "gap": mean_ci(gap),
        "short": wilson(sum(1 for g in games if sum(g["words"]) <= 4), n),
        "stuck": mean_ci(stuck),
        "mobility": mean(mobility) if mobility else 0.0,
        "dead_end_turns": (sum(1 for m in mobility if m <= 3) / len(mobility)) if mobility else 0.0,
        "lead_changes": mean_ci(lead_changes),
        "comeback": wilson(comebacks, decisive),
        "timeouts": mean_ci([sum(g["timeouts"]) for g in games]),
        "reasons": dict(reasons),
        "zero_words": wilson(reasons.get("zero_words", 0), n),
        "cap": reasons.get("cap", 0),
    }


def _trailed_at_halfway(g: dict, b_bonus: int = 0) -> bool:
    plies = g["plies"]
    if len(plies) < 4:
        return False
    _, _, a, b = plies[len(plies) // 2]
    b -= b_bonus
    if g["winner"] == 0:
        return a < b
    return b < a


def agent_results(games: list) -> dict:
    """Per-agent win rate across both sides, for paired matchups."""
    wins, played = Counter(), Counter()
    for g in games:
        for side, name in enumerate(g["agents"]):
            played[name] += 1
            if g["winner"] == side:
                wins[name] += 1
    return {name: wilson(wins[name], played[name]) for name in played}


def trap_letters(games: list) -> dict:
    """For each final letter of a word: the mover's legal moves on their next turn."""
    nxt = defaultdict(list)
    for g in games:
        plies = g["plies"]
        for t, (move, *_rest) in enumerate(plies):
            if "@" not in move:
                continue
            letter = move.split("@")[0][-1]
            for u in range(t + 2, len(plies), 2):  # same player's next turn
                follow, legal = plies[u][0], plies[u][1]
                if follow == "TIMEOUT":
                    break
                nxt[letter].append(0 if follow == "STUCK" else (legal or 0))
                break
    out = {}
    for letter, xs in nxt.items():
        out[letter] = {
            "n": len(xs),
            "mean_next_moves": mean(xs),
            "stuck_next": sum(1 for x in xs if x == 0) / len(xs),
        }
    return out
