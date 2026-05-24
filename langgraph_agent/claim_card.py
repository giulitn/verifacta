"""Claim Card generation: integrity hash + signed HTML output.

The SHA-256 hash covers `answer + indicator + timestamp` and is the
verifiability contract of the Claim Card. If you change the inputs,
order, or encoding, you also change the contract — update any external
verifier accordingly.
"""

import hashlib
import html
from pathlib import Path
from string import Template

_TEMPLATE_PATH = Path(__file__).resolve().parent / "templates" / "claim_card.html"


def compute_hash(answer: str, indicator: str, timestamp: str) -> str:
    """Return the SHA-256 hex digest of the integrity payload."""
    payload = f"{answer}{indicator}{timestamp}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def render(answer: str, indicator: str, timestamp: str, sha256: str) -> str:
    """Render the HTML Claim Card with escaped, signed contents."""
    template = Template(_TEMPLATE_PATH.read_text(encoding="utf-8"))
    return template.substitute(
        answer=html.escape(answer),
        indicator=html.escape(indicator),
        timestamp=html.escape(timestamp),
        sha256=html.escape(sha256),
    )
