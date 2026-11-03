"""Metrics, confidence intervals and reports from game records."""

from .metrics import agent_results, summarize, trap_letters, wilson
from .report import build_report, write_report

__all__ = ["agent_results", "build_report", "summarize", "trap_letters", "wilson", "write_report"]
