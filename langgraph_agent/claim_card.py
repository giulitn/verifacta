"""Claim Card generation: integrity hash + signed HTML output.

The SHA-256 hash covers `answer + canonical(indicators) + timestamp`, where
`canonical(indicators)` is a deterministic JSON serialization of the sorted
list of `{"database": str, "indicator": str}` citations. If you change the
inputs, ordering, or encoding, you also change the verifiability contract —
update any external verifier accordingly.

The renderer dispatches between two templates:
  - claim_card.html  : the agent successfully cited at least one source
  - rejection_card.html : the agent refused or returned nothing verifiable
"""

import hashlib
import html
import json
from pathlib import Path
from string import Template

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
_DATA_TEMPLATE_PATH = _TEMPLATES_DIR / "claim_card.html"
_REJECTION_TEMPLATE_PATH = _TEMPLATES_DIR / "rejection_card.html"


def _canonical_indicators(indicators: list[dict]) -> str:
    """Deterministic JSON for the hash payload. Sort keys + no whitespace."""
    return json.dumps(indicators, sort_keys=True, separators=(",", ":"))


def compute_hash(answer: str, indicators: list[dict], timestamp: str) -> str:
    """Return the SHA-256 hex digest of the integrity payload."""
    payload = f"{answer}{_canonical_indicators(indicators)}{timestamp}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _render_indicator_rows(indicators: list[dict]) -> str:
    """Render the list of cited indicators as escaped HTML table rows."""
    rows = []
    for c in indicators:
        rows.append(
            '<div class="indicator-row">'
            f'<span class="indicator-database">{html.escape(c["database"])}</span>'
            '<span class="indicator-separator">::</span>'
            f'<span class="indicator-code">{html.escape(c["indicator"])}</span>'
            "</div>"
        )
    return "\n".join(rows)


def render(
    answer: str, indicators: list[dict], timestamp: str, sha256: str
) -> str:
    """Render the right Claim Card variant for this answer.

    Empty `indicators` means the agent refused or could not verify anything —
    the rejection template is used so the artifact is clearly distinguishable
    from a verified data card.
    """
    if indicators:
        template = Template(_DATA_TEMPLATE_PATH.read_text(encoding="utf-8"))
        return template.substitute(
            answer=html.escape(answer),
            indicator_count=str(len(indicators)),
            indicator_rows=_render_indicator_rows(indicators),
            timestamp=html.escape(timestamp),
            sha256=html.escape(sha256),
        )
    template = Template(_REJECTION_TEMPLATE_PATH.read_text(encoding="utf-8"))
    return template.substitute(
        answer=html.escape(answer),
        timestamp=html.escape(timestamp),
        sha256=html.escape(sha256),
    )
