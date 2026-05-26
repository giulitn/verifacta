"""Persistent storage for emitted Claim Cards.

Each Claim Card is written to `{CLAIMS_DIR}/{sha256}.json` so the API can
serve it back via `GET /c/{sha256}`. That permalink is what a journalist
shares on social media — the SHA-256 by itself is unverifiable for a lay
reader, but a URL that resolves to the original card (with a direct link
to Data360) is.

The hash is content-addressable: writing the same card twice is a no-op,
which makes the call idempotent and safe under racing requests.
"""

import json
import logging
import os
import re
from pathlib import Path

logger = logging.getLogger("verifacta.claim_store")

# Default lives inside the package directory so `python -m verifacta` and
# `uvicorn api:app --app-dir langgraph_agent` both work without extra
# config. Override via CLAIMS_DIR when deploying behind a mounted volume.
_DEFAULT_DIR = Path(__file__).resolve().parent.parent / "claims"
CLAIMS_DIR = Path(os.environ.get("CLAIMS_DIR", _DEFAULT_DIR)).resolve()

# A SHA-256 hex digest is exactly 64 lowercase hex chars. Anything else in
# the URL is either a typo or a path-traversal probe — reject it before it
# reaches the filesystem.
_HASH_RE = re.compile(r"^[a-f0-9]{64}$")


def is_valid_hash(sha256: str) -> bool:
    """True iff `sha256` looks like a SHA-256 hex digest."""
    return bool(_HASH_RE.fullmatch(sha256))


def _path_for(sha256: str) -> Path:
    """Filesystem path for a given hash. Caller must validate the hash first."""
    return CLAIMS_DIR / f"{sha256}.json"


def save(card: dict) -> None:
    """Persist a Claim Card payload. No-op if the hash already exists.

    `card` must contain the same shape emitted by the agent:
    {"answer", "indicators", "timestamp", "sha256"}.
    """
    sha256 = card.get("sha256")
    if not sha256 or not is_valid_hash(sha256):
        # Shouldn't happen in practice — the agent always supplies a valid
        # hash — but failing soft beats crashing the SSE stream.
        logger.warning("claim_store.save received invalid sha256=%r", sha256)
        return

    CLAIMS_DIR.mkdir(parents=True, exist_ok=True)
    path = _path_for(sha256)
    if path.exists():
        return

    # Atomic write: dump to a sibling temp file, then rename. A reader
    # never sees a half-written file.
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(card, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)
    logger.info("Persisted claim %s", sha256[:12])


def load(sha256: str) -> dict | None:
    """Return the Claim Card payload for `sha256`, or None if not found."""
    if not is_valid_hash(sha256):
        return None
    path = _path_for(sha256)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        logger.exception("Failed to read claim file %s", path)
        return None
