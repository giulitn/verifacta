"""Thin async HTTP client used by all MCP tools.

Centralizing httpx calls here gives us a single place to:
  - apply the shared timeout,
  - add the Data360 → Indicators v2 fallback when we implement it,
  - add retries, instrumentation, or caching toggles later.

Tools should never instantiate `httpx.AsyncClient` directly.
"""

import httpx

from config import HTTP_TIMEOUT_SECONDS


async def get_json(url: str, *, params: dict | None = None) -> dict:
    """GET `url` with optional query params, return decoded JSON."""
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def post_json(url: str, *, json: dict) -> dict:
    """POST `json` body to `url`, return decoded JSON."""
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        response = await client.post(url, json=json)
        response.raise_for_status()
        return response.json()
