"""Logging configuration for the Verifacta agent.

Routes everything — agent prints, third-party libs (MCP, httpx, anthropic),
and uncaught exceptions — through one root logger so a single log file
captures the full run. The file is overwritten each run; tail it with:

    tail -f logs/verifacta.log
"""

import logging
import sys
from pathlib import Path


def setup_logging(log_path: Path, *, level: int = logging.INFO) -> None:
    """Configure the root logger to write to `log_path` and stderr."""
    log_path.parent.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    file_handler = logging.FileHandler(log_path, mode="w", encoding="utf-8")
    file_handler.setFormatter(formatter)
    stderr_handler = logging.StreamHandler(sys.stderr)
    stderr_handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(file_handler)
    root.addHandler(stderr_handler)

    # Route uncaught exceptions through the logger so tracebacks land in the file.
    def _log_uncaught(exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return
        logging.getLogger("verifacta").critical(
            "Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback)
        )

    sys.excepthook = _log_uncaught
