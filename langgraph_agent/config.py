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

# --- Model ----------------------------------------------------------------
# Format: "<provider>:<model_id>" (consumed by langchain.chat_models.init_chat_model).
# Default is Groq's free, fast, tool-calling-capable Llama. Override with
# VERIFACTA_MODEL to switch providers — see .env.example for examples.
MODEL_NAME = os.environ.get("VERIFACTA_MODEL", "groq:llama-3.3-70b-versatile")
MODEL_TEMPERATURE = 0

# Env var each provider expects for its API key. Used by require_provider_key()
# to fail fast with a useful message instead of a deep stack trace.
_PROVIDER_KEY_ENV = {
    "anthropic": "ANTHROPIC_API_KEY",
    "groq": "GROQ_API_KEY",
    "google_genai": "GOOGLE_API_KEY",
    "openai": "OPENAI_API_KEY",
    "mistralai": "MISTRAL_API_KEY",
}

# --- Data360 MCP server ---------------------------------------------------
# Verifacta consumes the official World Bank Data360 MCP server over HTTP.
# See https://github.com/worldbank/data360-mcp for the server itself.
# Default assumes you ran `uv run poe serve --port 8000 --transport http`
# in a local clone of that repo.
MCP_SERVER_URL = os.environ.get("DATA360_MCP_URL", "http://localhost:8000/mcp")

# --- Paths ----------------------------------------------------------------
CLAIM_CARD_OUTPUT = Path(__file__).resolve().parent / "claim_card_prototype.html"
LOG_FILE = _REPO_ROOT / "logs" / "verifacta.log"


def require_provider_key() -> None:
    """Verify the API key env var for the configured model's provider is set."""
    if ":" not in MODEL_NAME:
        return  # Unknown format — let init_chat_model raise its own error.
    provider = MODEL_NAME.split(":", 1)[0]
    env_var = _PROVIDER_KEY_ENV.get(provider)
    if env_var and not os.environ.get(env_var):
        raise RuntimeError(
            f"{env_var} is not set (required for VERIFACTA_MODEL={MODEL_NAME!r}). "
            "Copy .env.example to .env and fill it in, or export the variable in "
            "your shell."
        )
