"""Runtime configuration for the Verifacta agent.

Loads environment variables from `.env` (if present) and exposes typed
settings. Centralizing this keeps `os.environ` out of business logic.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load `.env` from the repo root (one level above this package directory).
# `override=False` means real environment variables still win.
_REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_REPO_ROOT / ".env", override=False)

# --- Anthropic / model ----------------------------------------------------
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL_NAME = os.environ.get("VERIFACTA_MODEL", "claude-sonnet-4-6")
MODEL_TEMPERATURE = 0

# --- Paths ----------------------------------------------------------------
MCP_SERVER_PATH = str(_REPO_ROOT / "mcp_server" / "server.py")
CLAIM_CARD_OUTPUT = Path(__file__).resolve().parent / "claim_card_prototype.html"


def require_anthropic_key() -> str:
    """Return the Anthropic API key or raise a clear error."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill it in, "
            "or export the variable in your shell."
        )
    return ANTHROPIC_API_KEY
