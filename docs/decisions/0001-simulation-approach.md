# 0001: Simulation approach

Date: 2026-11-03 · Status: accepted

## Context

Rules v1 and v2 were tested with 120–150 games per variant between one greedy bot pair, using a modeled "human timer". The results were noisy (about ±9 points on win rates) and the timeout numbers came from the timer model, not the rules.

## Decision

- **Pure engine with rule flags.** Each variant is a config, so rule sets are compared in one loop and the same engine can back the real game.
- **No timer model.** Bots find words instantly; the timer only paces human play. Timeout rules (word ban, zero-words loss, timeout tie-break) are checked mechanically with injected random timeouts. Their fairness needs human playtests.
- **Bot tiers:** random, greedy, defensive (maximize own mobility), aggressive (minimize the opponent's), and a search bot (minimax or MCTS). Balance is reported per skill level.
- **Statistics:** paired games with sides swapped, 1,000+ games per variant, confidence intervals, one rule changed at a time.
- **Records:** one JSONL line per game (seed, config, agents, moves). Boards and metrics are rebuilt on replay.
- **LLM review:** reads selected replays and computed stats, proposes hypotheses, and every hypothesis is tested in the simulator.

## Deferred

Dashboard, reinforcement learning, simulated human timing, OpenSpiel or Ludii. Revisit if the search bot is too weak or slow, or if reading reports becomes the bottleneck.

## Updates

- **The timer was later removed from the game** (Rules v4), so timeout rules no longer exist. Injected timeouts are kept only so the `timeouts` experiment can be reproduced.
- **The search bot is a two-ply lookahead,** not minimax or MCTS. A rule-agnostic MCTS bot is still planned, to confirm results under rules that change what winning means.
