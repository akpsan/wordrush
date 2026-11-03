"""Timeout mechanics, stuck rules, and invariants under random play."""

import random

from wordrush_sim.engine import (
    PRESETS,
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
from wordrush_sim.engine.rules import V5, V6, V7


def test_timeout_on_first_move_loses_under_zero_words_rule():
    s = new_game(V7, get_lexicon("everyday-3to5"))
    s = apply(s, TIMEOUT)
    assert s.over and s.reason == "zero_words" and s.winner == 1


def test_timeout_removing_only_word_loses():
    s = new_game(V7, get_lexicon("everyday-3to5"))
    s = apply(s, legal_moves(s)[0])  # A
    s = apply(s, legal_moves(s)[0])  # B
    s = apply(s, TIMEOUT)  # A loses its only word
    assert s.over and s.winner == 1 and s.reason == "zero_words"


def test_without_zero_words_rule_player_reopens_anywhere():
    s = new_game(V6, get_lexicon("everyday-3to5"))
    s = apply(s, legal_moves(s)[0])
    s = apply(s, legal_moves(s)[0])
    s = apply(s, TIMEOUT)
    assert not s.over and s.chains[0] == []
    s = apply(s, legal_moves(s)[0])  # B
    starts = {m.start for m in legal_moves(s)}
    assert len(starts) > 2  # no longer tied to the corner


def test_timeout_ban_is_global():
    lex = Lexicon(["toe", "ear", "eel", "ewe", "let", "tee", "lee"])
    s = new_game(V6.with_(n=6), lex)
    s = apply(s, Move("toe", 0, H))
    s = apply(s, TIMEOUT)  # B has no words yet; nothing removed
    s = apply(s, Move("ear", 2, V))
    s = apply(s, TIMEOUT)  # B again
    s = apply(s, TIMEOUT)  # A: EAR removed and banned
    assert "ear" in s.banned and s.chains[0] and "ear" not in s.on_board
    assert "ear" not in {m.word for m in legal_moves(s, 0)}
    assert "ear" not in {m.word for m in legal_moves(s, 1)}


def test_revive_chains_from_older_word():
    lex = Lexicon(["abc", "cde", "axy"])
    s = new_game(V5.with_(n=5, stuck="revive", crossing=False), lex)
    s = apply(s, Move("abc", 0, H))  # A: a b c at row 0
    s = apply(s, STUCK)  # B passes
    s = apply(s, Move("cde", 2, V))  # down from the C
    s = apply(s, STUCK)
    # From CDE nothing fits (no word starts or ends on c/d/e that is unused); revive from ABC.
    moves = legal_moves(s)
    assert {m.word for m in moves} == {"axy"}


def check_invariants(s):
    n2 = s.n * s.n
    users = [0] * n2
    for p in s.placements.values():
        for cell, ch in zip(p.cells, p.word):
            assert s.letters[cell] == ch
            users[cell] += 1
    assert users == s.users
    for i in range(n2):
        assert bool(s.letters[i]) == (s.users[i] > 0) == (s.owner[i] >= 0)
    assert s.cells_owned == [s.owner.count(0), s.owner.count(1)]
    assert set(s.on_board) == {p.word for p in s.placements.values()}
    assert not (set(s.on_board) & s.banned)


def test_random_play_invariants_all_presets():
    lex = get_lexicon("everyday-3to5")
    rng = random.Random(7)
    for name, rules in PRESETS.items():
        for n in (6, 8):
            for _ in range(15):
                s = new_game(rules.with_(n=n), lex)
                while not s.over:
                    moves = legal_moves(s)
                    if not moves:
                        move = STUCK
                    elif rng.random() < 0.1:
                        move = TIMEOUT
                    else:
                        move = rng.choice(moves)
                    s = apply(s, move)
                    check_invariants(s)
                assert s.reason in {"stuck", "both_passed", "full", "zero_words", "cap", "cornered"}


def test_rules_v3_first_player_fix():
    from wordrush_sim.engine.rules import V8

    lex = get_lexicon("everyday-3to5")
    s = new_game(V8, lex)
    assert max(len(m.word) for m in legal_moves(s)) == 4  # A's first word
    s = apply(s, legal_moves(s)[0])
    assert max(len(m.word) for m in legal_moves(s)) == 5  # B is unaffected
    s = apply(s, legal_moves(s)[0])
    assert max(len(m.word) for m in legal_moves(s)) == 5  # A's later words
    assert s.score(1) == s.cells_owned[1] + 0.5


def test_half_point_bonus_means_no_draws():
    from wordrush_sim.engine.rules import V8

    lex = get_lexicon("everyday-3to5")
    rng = random.Random(3)
    for _ in range(30):
        s = new_game(V8, lex)
        while not s.over:
            moves = legal_moves(s)
            s = apply(s, rng.choice(moves) if moves else STUCK)
        assert s.winner in (0, 1)


def test_cornered_player_loses():
    from wordrush_sim.engine.rules import V9

    lex = get_lexicon("everyday-3to5")
    rng = random.Random(5)
    for _ in range(30):
        s = new_game(V9, lex)
        while not s.over:
            moves = legal_moves(s)
            if not moves:
                stuck = s.to_move
                s = apply(s, STUCK)
                assert s.over and s.reason == "cornered" and s.winner == 1 - stuck
                break
            s = apply(s, rng.choice(moves))
        assert s.reason in {"cornered", "full"}


def test_current_rules_full_board_tie_goes_to_b():
    from wordrush_sim.engine.game import _finish
    from wordrush_sim.engine.rules import CURRENT

    s = new_game(CURRENT.with_(n=6), get_lexicon("everyday-3to5"))
    s.cells_owned = [18, 18]
    _finish(s, "full")
    assert s.winner == 1
    assert CURRENT.b_bonus == 0 and CURRENT.stuck == "lose" and CURRENT.a_first_max_len == 4
