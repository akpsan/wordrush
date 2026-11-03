"""Export simulator games as a fixture for the app's TypeScript engine tests.

The app replays every move and checks it makes the same decisions: the same number
of legal moves before each move, and the same winner. Run from sim/:

    uv run python scripts/export_conformance.py
"""

import json
from pathlib import Path

from wordrush_sim.records import load_run, resolve_run

VARIANT = "v3 + cornered loses"  # Rules v4 plus B's +0.5, which never decides a cornered game
OUT = Path(__file__).resolve().parents[2] / "app/src/engine/__tests__/fixtures/sim-games.json"
GAMES_PER_MATCHUP = 150

manifest, games = load_run(resolve_run("cornered"))
picked, seen = [], {}
for g in games:
    key = tuple(g["agents"])
    if g["variant"] != VARIANT or seen.get(key, 0) >= GAMES_PER_MATCHUP:
        continue
    seen[key] = seen.get(key, 0) + 1
    picked.append({
        "agents": g["agents"],
        "plies": [[p[0], p[1]] for p in g["plies"]],
        "winner": g["winner"],
        "reason": g["reason"],
    })
OUT.write_text(json.dumps({"variant": VARIANT, "dictionary": "everyday-3to5", "games": picked}))
print(f"wrote {len(picked)} games to {OUT}")
