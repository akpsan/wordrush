"""Markdown reports from a run directory."""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path

from ..agents import AGENTS
from ..records import load_run
from .metrics import agent_results, summarize, trap_letters

REPORTS_DIR = Path(__file__).resolve().parents[3] / "reports"


def pct(x: float) -> str:
    return f"{100 * x:.0f}%"


def ci_pct(t) -> str:
    p, lo, hi = t
    return f"{100 * p:.0f}% ({100 * lo:.0f}–{100 * hi:.0f})"


def num(t, digits=1) -> str:
    m, h = t
    return f"{m:.{digits}f} ± {h:.{digits}f}"


def build_report(run_dir: Path) -> str:
    manifest, games = load_run(run_dir)
    order = manifest["variant_order"]
    bonus = {name: spec["rules"].get("b_bonus", 0) for name, spec in manifest["variants"].items()}
    groups = defaultdict(list)
    for g in games:
        a, b = g["agents"]
        key = (g["variant"], a if a == b else " vs ".join(sorted((a, b), key=list(AGENTS).index)))
        groups[key].append(g)

    lines = [
        f"# {manifest['experiment']}",
        "",
        manifest["description"],
        "",
        f"Run `{manifest['created']}` · {len(games)} games · seed {manifest['seed']} · Python {manifest['python']}",
        "",
        "Intervals are 95%. Win rates: Wilson intervals. Means: ± half-width.",
        "",
    ]

    mirrors = [k for k in groups if " vs " not in k[1]]
    if mirrors:
        lines += [
            "## Same bot on both sides",
            "",
            "| Variant | Bot | Games | Words per player | Board filled | A wins | B wins | Draws "
            "| Score gap | ≤4 words total | Lead changes | Comebacks | Stuck turns | Legal moves per turn "
            "| Turns with ≤3 moves | Timeouts | Zero-words losses |",
            "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
        for key in sorted(mirrors, key=lambda k: (order.index(k[0]), list(AGENTS).index(k[1]))):
            s = summarize(groups[key], bonus[key[0]])
            lines.append(
                f"| {key[0]} | {key[1]} | {s['games']} | {num(s['words'])} | {pct(s['fill'][0])} "
                f"| {ci_pct(s['a_win'])} | {ci_pct(s['b_win'])} | {pct(s['draw'][0])} "
                f"| {num(s['gap'])} | {pct(s['short'][0])} | {num(s['lead_changes'])} "
                f"| {pct(s['comeback'][0])} | {s['stuck'][0]:.1f} | {s['mobility']:.0f} "
                f"| {pct(s['dead_end_turns'])} | {s['timeouts'][0]:.1f} | {pct(s['zero_words'][0])} |"
            )
        lines += ["", "End reasons:", ""]
        for key in sorted(mirrors, key=lambda k: (order.index(k[0]), list(AGENTS).index(k[1]))):
            reasons = summarize(groups[key], bonus[key[0]])["reasons"]
            text = ", ".join(f"{r} {c}" for r, c in sorted(reasons.items(), key=lambda t: -t[1]))
            lines.append(f"- {key[0]} / {key[1]}: {text}")
        lines.append("")

    pairs = [k for k in groups if " vs " in k[1]]
    if pairs:
        lines += [
            "## Bot against bot (paired: each seed played from both sides)",
            "",
            "| Variant | Matchup | Games | First bot wins | Second bot wins | A wins | Words per player |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
        for key in sorted(pairs, key=lambda k: (order.index(k[0]), k[1])):
            gs = groups[key]
            first, second = key[1].split(" vs ")
            res = agent_results(gs)
            s = summarize(gs, bonus[key[0]])
            lines.append(
                f"| {key[0]} | {key[1]} | {len(gs)} | {ci_pct(res[first])} | {ci_pct(res[second])} "
                f"| {pct(s['a_win'][0])} | {s['words'][0]:.1f} |"
            )
        lines.append("")

    if manifest.get("notes", {}).get("trap_letters"):
        lines += ["## Word endings and the next turn", ""]
        for variant in order:
            gs = [g for g in games if g["variant"] == variant]
            traps = trap_letters(gs)
            rows = sorted(traps.items(), key=lambda t: t[1]["mean_next_moves"])
            lines += [
                f"### {variant}",
                "",
                "| Last letter | Words | Next-turn legal moves | Stuck next turn |",
                "| --- | --- | --- | --- |",
            ]
            for letter, t in rows:
                if t["n"] >= 50:
                    lines.append(
                        f"| {letter.upper()} | {t['n']} | {t['mean_next_moves']:.0f} | {pct(t['stuck_next'])} |"
                    )
            lines.append("")
    return "\n".join(lines)


def write_report(run_dir: Path) -> Path:
    text = build_report(run_dir)
    manifest, _ = load_run(run_dir)
    REPORTS_DIR.mkdir(exist_ok=True)
    path = REPORTS_DIR / f"{manifest['experiment']}.md"
    path.write_text(text + "\n")
    return path
