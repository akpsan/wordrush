"""Replay the dry runs from docs/rules.md and check boards, legality and scores."""

from wordrush_sim.engine import (
    STUCK,
    TIMEOUT,
    H,
    Lexicon,
    Move,
    V,
    apply,
    get_lexicon,
    legal_moves,
    new_game,
)
from wordrush_sim.engine.rules import V1, V5


def play(state, word, r, c, d):
    move = Move(word, r * state.n + c, d)
    legal = {m.key for m in legal_moves(state)}
    assert move.key in legal, f"{word}@{r},{c} should be legal"
    return apply(state, move)


def board(text):
    return "\n".join(" ".join(row.split()) for row in text.strip().splitlines())


def with_everyday(*words):
    return Lexicon(set(get_lexicon("everyday-3to5").words) | set(words))


def test_dry_run_1_drift():
    s = new_game(V1, with_everyday("handy", "stamp", "heard", "alt", "rover", "let", "rows", "the"))
    s = play(s, "handy", 0, 1, V)
    s = play(s, "stamp", 1, 5, V)
    s = play(s, "heard", 0, 1, H)
    s = play(s, "alt", 3, 5, H)
    s = play(s, "rover", 0, 4, V)
    s = play(s, "let", 3, 6, V)
    s = play(s, "rows", 4, 4, V)
    s = play(s, "the", 5, 6, V)
    assert s.render() == board("""
        . H E A R D . .
        . A . . O s . .
        . N . . V t . .
        . D . . E a l t
        . Y . . R m e .
        . . . . O p t .
        . . . . W . h .
        . . . . S . e .
    """)
    assert legal_moves(s) == []  # A is stuck, even with a real dictionary
    s = apply(s, STUCK)
    assert s.over and s.reason == "stuck"
    assert (s.score(0), s.score(1), s.winner) == (16, 11, 0)


def test_dry_run_2_wall():
    s = new_game(V1, with_everyday("risen", "eagle", "not", "games", "ought", "slots"))
    s = play(s, "risen", 0, 1, H)
    s = play(s, "eagle", 1, 1, H)
    s = play(s, "not", 0, 5, H)
    s = play(s, "games", 1, 3, V)
    s = play(s, "ought", 0, 6, V)
    s = play(s, "slots", 5, 3, H)
    assert s.render() == board("""
        . R I S E N O T
        . e a g l e U .
        . . . a . . G .
        . . . m . . H .
        . . . e . . T .
        . . . s l o t s
        . . . . . . . .
        . . . . . . . .
    """)
    assert legal_moves(s) == []
    s = apply(s, STUCK)
    assert (s.score(0), s.score(1), s.winner) == (11, 13, 1)


def test_dry_run_3_patched_rules():
    words = ["today", "total", "drink", "skull", "neat", "pearl", "acre", "acres", "res", "stir"]
    s = new_game(V5.with_(n=6), Lexicon(words))
    s = play(s, "today", 0, 0, V)
    s = play(s, "total", 5, 1, H)  # ends in the bottom-right corner
    s = play(s, "drink", 2, 0, H)
    s = play(s, "skull", 1, 5, V)  # ends on the L
    s = play(s, "neat", 2, 3, V)  # crosses B's T
    s = play(s, "pearl", 4, 1, H)  # crosses A's A, ends on the L
    s = play(s, "acre", 3, 0, H)  # crosses its own A, ends on the E
    assert s.render() == board("""
        T . . . . .
        O . . . . s
        D R I N K k
        A C R E . u
        Y p e A r l
        . t o t a l
    """)
    s = apply(s, TIMEOUT)  # B: PEARL removed, the shared A and L stay
    assert s.letters[4 * 6 + 3] == "a" and s.letters[4 * 6 + 5] == "l"
    assert s.letters[4 * 6 + 1] == ""
    s = play(s, "acres", 3, 0, H)  # the cheap +1
    s = play(s, "res", 1, 3, H)  # ends on SKULL's S
    s = play(s, "stir", 0, 2, V)  # ends on the R
    assert (s.score(0), s.score(1)) == (16, 11)  # B is 5 cells behind at move 12


def test_two_cell_minimum_blocks_cheap_plus_one():
    s = new_game(V5.with_(n=6, min_new_cells=2), Lexicon(["acre", "acres", "cab"]))
    s = play(s, "acre", 0, 0, H)
    overlap = ("acres", 0, H)  # over ACRE, adding only the S
    assert overlap not in {m.key for m in legal_moves(s, player=0)}
    assert ("acres", 0, V) in {m.key for m in legal_moves(s, player=0)}
    s1 = new_game(V5.with_(n=6), Lexicon(["acre", "acres", "cab"]))
    s1 = play(s1, "acre", 0, 0, H)
    assert overlap in {m.key for m in legal_moves(s1, player=0)}
