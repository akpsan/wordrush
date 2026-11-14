"""Export hex-mode games as a fixture for the app's TypeScript engine tests (hex conformance).

Plays fresh games with the simulator's bots under the hex preset, recording before every
chained move the number of legal moves, like export_conformance.py does for the square board.
Run from sim/:

    uv run python scripts/export_hex_conformance.py          # HEX  -> sim-hex-games.json
    uv run python scripts/export_hex_conformance.py HEX2     # HEX2 -> sim-hex2-games.json (two-way words)
"""

import json
import random
import sys
from pathlib import Path

from wordrush_sim.agents.bots import make_agent
from wordrush_sim.engine import STUCK, apply, encode, get_lexicon, legal_moves, new_game
from wordrush_sim.engine.rules import PRESETS

PRESET = sys.argv[1] if len(sys.argv) > 1 else "HEX"
RULES = PRESETS[PRESET]
FIXTURE = {"HEX": "sim-hex-games.json", "HEX2": "sim-hex2-games.json"}[PRESET]
OUT = Path(__file__).resolve().parents[2] / "app/src/engine/__tests__/fixtures" / FIXTURE
MATCHUPS = [("balanced", "balanced"), ("aggressive", "random"), ("random", "greedy"), ("greedy", "aggressive")]
GAMES_PER_MATCHUP = 40 if PRESET == "HEX" else 20

lex = get_lexicon("everyday-3to5")
games = []
for m, agents in enumerate(MATCHUPS):
    for i in range(GAMES_PER_MATCHUP):
        seed = 7000 + m * 1000 + i
        bots = [make_agent(a) for a in agents]
        rngs = [random.Random(seed * 2 + side) for side in (0, 1)]
        state = new_game(RULES, lex)
        plies = []
        while not state.over:
            p = state.to_move
            moves = legal_moves(state)
            move = bots[p].choose(state, moves, rngs[p]) if moves else STUCK
            plies.append([encode(move, RULES.n), len(moves) if state.chains[p] else None])
            state = apply(state, move)
        games.append({"agents": list(agents), "plies": plies, "winner": state.winner, "reason": state.reason})

OUT.write_text(json.dumps({"rules": PRESET, "n": RULES.n, "dictionary": "everyday-3to5", "games": games}))
print(f"wrote {len(games)} games to {OUT}")
