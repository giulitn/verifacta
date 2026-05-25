"""Langfuse observability hook for the agent.

Attaches a LangChain callback handler so every node of an agent run —
LLM calls, tool invocations, intermediate state — lands in a Langfuse
trace. The handler is configured via environment variables:

    LANGFUSE_PUBLIC_KEY   from https://cloud.langfuse.com/ → Settings → API Keys
    LANGFUSE_SECRET_KEY   (same)
    LANGFUSE_HOST         optional; defaults to Langfuse Cloud

Cleanly no-ops when either key is missing, so local CLI runs and
unconfigured environments don't crash on import or invocation.
"""

import logging
import os
from typing import Any, Optional

logger = logging.getLogger("verifacta.observability")

_handler: Optional[Any] = None
_client: Optional[Any] = None
_initialized = False


def _try_init() -> None:
    """Best-effort initialization, run once per process."""
    global _handler, _client, _initialized
    if _initialized:
        return
    _initialized = True

    public_key = os.environ.get("LANGFUSE_PUBLIC_KEY", "").strip()
    secret_key = os.environ.get("LANGFUSE_SECRET_KEY", "").strip()
    if not public_key or not secret_key:
        logger.info(
            "Langfuse disabled (LANGFUSE_PUBLIC_KEY/LANGFUSE_SECRET_KEY unset)"
        )
        return

    try:
        from langfuse import Langfuse
        from langfuse.langchain import CallbackHandler
    except ImportError:
        logger.warning("langfuse package not installed; observability disabled")
        return

    host = os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com").strip()
    try:
        _client = Langfuse()
        _handler = CallbackHandler()
        logger.info("Langfuse observability enabled (host=%s)", host)
    except Exception:
        # Don't crash the app if Langfuse refuses (bad keys, network down, etc.)
        logger.exception("Langfuse init failed; observability disabled")
        _handler = None
        _client = None


def get_callback_handler() -> Optional[Any]:
    """Return the Langfuse CallbackHandler, or None when not configured."""
    _try_init()
    return _handler


def update_current_trace(
    *,
    metadata: Optional[dict] = None,
    tags: Optional[list[str]] = None,
    output: Optional[Any] = None,
) -> None:
    """Attach final-state metadata to the active trace.

    Used after the agent finishes to record the SHA-256 hash, indicators
    cited, and whether the run was a refusal — fields we don't know
    until the very end of the run. No-op when Langfuse is disabled.
    """
    _try_init()
    if _client is None:
        return
    try:
        _client.update_current_trace(
            metadata=metadata or None,
            tags=tags or None,
            output=output,
        )
    except Exception:
        logger.exception("Failed to update Langfuse trace")


def flush() -> None:
    """Force pending events to flush. Useful before the process exits."""
    _try_init()
    if _client is None:
        return
    try:
        _client.flush()
    except Exception:
        logger.exception("Failed to flush Langfuse client")
