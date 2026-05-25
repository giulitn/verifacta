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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import agent

logger = logging.getLogger("verifacta.api")

app = FastAPI(title="Verifacta API", version="0.2.0")

# CORS — allow the Vercel frontend (set via env) plus localhost dev.
_frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
_allowed_origins = [o for o in [_frontend_origin, "http://localhost:3000"] if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
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
    }


@app.post("/ask")
async def ask(req: AskRequest) -> StreamingResponse:
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
    """Translate the agent's event stream into SSE wire bytes."""
    try:
        async for event in agent.run_agent_stream(query):
            yield _format_sse(event["type"], event["data"])
        yield _format_sse("done", {})
    except Exception as exc:
        logger.exception("Agent run failed")
        yield _format_sse("error", {"message": str(exc)})


def _format_sse(event_type: str, data: dict) -> bytes:
    """Encode one event in the Server-Sent Events wire format."""
    payload = json.dumps(data, separators=(",", ":"))
    return f"event: {event_type}\ndata: {payload}\n\n".encode("utf-8")
