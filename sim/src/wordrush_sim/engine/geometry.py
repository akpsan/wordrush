"""Board shapes. Cells are always indexed r * n + c in an n x n array.

'square': every cell is on the board; words run across (H) or down (V).
'hex': a hexagon of radius R = n // 2 in axial coordinates (q = c - R, r = row - R), drawn
pointy-top with each row shifted half a cell per row. Cells with |q + r| > R are off the board.
Words run across (H, left to right), down (V, down-right on screen) or down-left (D), so every
word reads left to right or downwards. A's corner is the hexagon's top-left, B's its bottom-right.
"""

from __future__ import annotations

from functools import lru_cache
from typing import NamedTuple


class Geometry(NamedTuple):
    n: int
    valid: tuple
    """valid[i] is True when cell i is on the board."""
    dirs: tuple
    """(dr, dc) per direction index: 0 = H, 1 = V, 2 = D."""
    a_corner: int
    b_corner: int
    cells: int


@lru_cache(maxsize=None)
def geometry(board: str, n: int, two_way: bool = False) -> Geometry:
    """two_way (hex only): words may also read backwards, adding directions h, v, d (3, 4, 5)."""
    if board == "square":
        if two_way:
            raise ValueError("two_way is only defined for hex boards")
        return Geometry(n, (True,) * (n * n), ((0, 1), (1, 0)), 0, n * n - 1, n * n)
    if board == "hex":
        if n % 2 == 0:
            raise ValueError("a hex board needs an odd n (2R + 1)")
        R = n // 2
        valid = tuple(R <= r + c <= 3 * R for r in range(n) for c in range(n))
        dirs = ((0, 1), (1, 0), (1, -1))
        if two_way:
            dirs += tuple((-dr, -dc) for dr, dc in dirs)
        return Geometry(n, valid, dirs, R, 2 * R * n + R, sum(valid))
    raise ValueError(f"unknown board {board!r}")


def ray(g: Geometry, cell: int, d: int, sign: int, limit: int) -> list:
    """Cells from `cell` (inclusive) along direction d (sign +1 forward, -1 backward), at most `limit`."""
    dr, dc = g.dirs[d]
    dr, dc = dr * sign, dc * sign
    n = g.n
    r, c = divmod(cell, n)
    out = []
    while len(out) < limit and 0 <= r < n and 0 <= c < n and g.valid[r * n + c]:
        out.append(r * n + c)
        r += dr
        c += dc
    return out


def step(n: int, d: int) -> int:
    """Index distance between consecutive letters in direction d."""
    return (1, n, n - 1, -1, -n, -(n - 1))[d]
