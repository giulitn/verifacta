"""FastAPI HTTP wrapper around the Verifacta agent.

Phase 0 scaffold: only `/health` is wired. `/ask` (SSE-streamed agent run)
lands in Phase 1 when we refactor agent.py to expose an async iterator of
events instead of writing a Claim Card file to disk.

Run locally:
    uvicorn api:app --app-dir langgraph_agent --reload --port 8001

Run in container:
    uvicorn api:app --app-dir langgraph_agent --host 0.0.0.0 --port $PORT

Port 8001 (not 8000) locally to avoid colliding with the Data360 MCP server,
which CLAUDE.md instructs to run on 8000.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Verifacta API", version="0.1.0")

# CORS — Phase 0 allows the Vercel frontend (set via env) plus localhost.
# Tighten before Phase 1 ships to production.
_frontend_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
_allowed_origins = [o for o in [_frontend_origin, "http://localhost:3000"] if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Liveness probe — Railway uses this for healthchecks."""
    return {"status": "ok", "service": "verifacta", "phase": "0"}


@app.get("/")
def root() -> dict:
    return {
        "service": "verifacta",
        "docs": "/docs",
        "health": "/health",
    }
