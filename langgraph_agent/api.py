"""FastAPI HTTP wrapper around the Verifacta agent.

Exposes `/ask` which streams the agent run as Server-Sent Events. Every
event carries a `type` (tool_call_start, tool_call_end, final_answer,
claim_card, error, done) and a JSON `data` payload — same contract as
`agent.run_agent_stream`.

Run locally:
    uvicorn api:app --app-dir langgraph_agent --reload --port 8001

Run in container:
    uvicorn api:app --app-dir langgraph_agent --host 0.0.0.0 --port $PORT

Port 8001 (not 8000) locally to avoid colliding with the Data360 MCP
server, which CLAUDE.md instructs to run on 8000.
"""

import json
import logging
import os
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import agent
import claim_store

logger = logging.getLogger("verifacta.api")

app = FastAPI(title="Verifacta API", version="0.3.0")


def _parse_origins(raw: str) -> list[str]:
    """Split FRONTEND_ORIGIN on commas, trim whitespace, drop trailing slash."""
    return [piece.strip().rstrip("/") for piece in raw.split(",") if piece.strip()]


# CORS — Vercel frontend (set via env) plus localhost dev. Supports a
# comma-separated list of origins, and an optional regex for preview
# deploys (e.g. https://.*\.vercel\.app).
_frontend_origins = _parse_origins(os.getenv("FRONTEND_ORIGIN", ""))
_allowed_origins = _frontend_origins + ["http://localhost:3000"]
_frontend_origin_regex = os.getenv("FRONTEND_ORIGIN_REGEX", "").strip() or None

logger.info(
    "CORS allow_origins=%s allow_origin_regex=%s",
    _allowed_origins,
    _frontend_origin_regex,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=_frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# Rate limit — keyed by client IP, in-memory (single-replica is fine
# for the demo; if we ever scale horizontally, point slowapi at Redis).
# RATE_LIMIT honors slowapi's syntax: "<count>/<period>" or a list
# separated by ";" (e.g. "30/hour;5/minute"). Default is generous for a
# journalist doing real research but firm enough to keep abuse cheap.
def _client_ip(request: Request) -> str:
    """Return the client's IP, honoring X-Forwarded-For behind a proxy.

    Railway terminates TLS and forwards to the container; without this
    the rate limit would key on the proxy's internal IP and become a
    de-facto global limit instead of per-client.
    """
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


_RATE_LIMIT = os.getenv("RATE_LIMIT", "30/hour")
limiter = Limiter(key_func=_client_ip, headers_enabled=True)
app.state.limiter = limiter

logger.info("Rate limit on /ask: %s per client IP", _RATE_LIMIT)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_exceeded(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Friendly 429 — the LLM credits are real money, not a bottomless well."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": (
                "Whoa, easy there. The LLM credits behind every answer are "
                "real money — and even the World Bank rate-limits us. Give "
                "it a minute and try again."
            ),
            "limit": str(exc.detail),
        },
        headers={"Retry-After": "60"},
    )


class AskRequest(BaseModel):
    """Body of POST /ask."""

    query: str = Field(min_length=1, max_length=2000)


@app.get("/health")
def health() -> dict:
    """Liveness probe — Railway uses this for healthchecks."""
    return {"status": "ok", "service": "verifacta", "phase": "1"}


@app.get("/")
def root() -> dict:
    return {
        "service": "verifacta",
        "docs": "/docs",
        "health": "/health",
        "ask": "POST /ask  body: {\"query\": \"...\"}",
        "claim": "GET /c/{sha256}  — fetch a persisted Claim Card",
    }


@app.get("/c/{sha256}")
def get_claim(sha256: str) -> dict:
    """Return a previously emitted Claim Card by its SHA-256 digest.

    This is the permalink that journalists share — a reader who opens it
    gets the original answer, the cited indicator, the verification
    timestamp, and the hash that ties them together. If the hash doesn't
    resolve, return 404 instead of revealing which paths exist.
    """
    if not claim_store.is_valid_hash(sha256):
        raise HTTPException(status_code=400, detail="invalid sha256 format")
    card = claim_store.load(sha256)
    if card is None:
        raise HTTPException(status_code=404, detail="claim not found")
    return card


@app.post("/ask")
@limiter.limit(_RATE_LIMIT)
async def ask(request: Request, req: AskRequest) -> StreamingResponse:
    """Stream the agent run as Server-Sent Events.

    Clients consume the response as text/event-stream and parse each
    event by its `event:` line. The stream ends with `event: done` on
    success or `event: error` on failure.
    """
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="query must be non-empty")

    return StreamingResponse(
        _event_source(query),
        media_type="text/event-stream",
        headers={
            # Disable proxy buffering so events flush to the client as they
            # are produced (Railway sits behind a load balancer).
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
        },
    )


async def _event_source(query: str) -> AsyncIterator[bytes]:
    """Translate the agent's event stream into SSE wire bytes.

    Side-effect: when a `claim_card` event passes through, persist its
    payload so the permalink (`GET /c/{sha256}`) resolves later. The
    write is best-effort — a storage failure must not break the stream
    the journalist is watching live.
    """
    try:
        async for event in agent.run_agent_stream(query):
            if event["type"] == "claim_card":
                try:
                    claim_store.save(event["data"])
                except Exception:
                    logger.exception("Failed to persist Claim Card")
            yield _format_sse(event["type"], event["data"])
        yield _format_sse("done", {})
    except Exception as exc:
        logger.exception("Agent run failed")
        yield _format_sse("error", {"message": _describe_exception(exc)})


def _describe_exception(exc: BaseException) -> str:
    """Return a one-line, debuggable description of an exception.

    Unwraps ExceptionGroup (raised by asyncio.TaskGroup) so the surface
    error in the UI names the actual underlying cause instead of the
    opaque "unhandled errors in a TaskGroup" wrapper.
    """
    if isinstance(exc, BaseExceptionGroup):
        inner = exc.exceptions[0] if exc.exceptions else exc
        return f"{type(inner).__name__}: {inner}"
    return f"{type(exc).__name__}: {exc}"


def _format_sse(event_type: str, data: dict) -> bytes:
    """Encode one event in the Server-Sent Events wire format."""
    payload = json.dumps(data, separators=(",", ":"))
    return f"event: {event_type}\ndata: {payload}\n\n".encode("utf-8")
