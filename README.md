# Verifacta

> A conversational, cryptographically-verifiable interface to World Bank data — built so journalists can use AI for data context without inheriting its misinformation.

## Why this exists

LLMs replicate state-sponsored disinformation. NewsGuard (2025) found that **33% of chatbot queries** reproduce content from contamination networks like Russia's *Pravda*, which seed propaganda specifically to poison model training data.

When journalists turn to ChatGPT or Gemini for context on economic or social statistics, they have no way to tell whether the number came from an official source or a contaminated one. That's the problem Verifacta solves.

## The solution

A conversational agent whose **only data source** is the World Bank's official Data360 API. It is structurally impossible to contaminate, because it does not perform open web searches. Every answer is accompanied by a **Claim Card** — a cryptographically-signed, embeddable artifact that proves provenance and lets any reader reproduce the query independently.

## Two layers

Verifacta is built as two decoupled components:

- **Layer 1 — MCP server for Data360** (`mcp_server/`). An open-source [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the World Bank Data360 API as a set of structured tools usable by any LLM, agent, or IDE. This is **public-good infrastructure**: any developer can build on top of it, not just Verifacta.
- **Layer 2 — Verifacta agent** (`langgraph_agent/`). A LangGraph ReAct agent that consumes Layer 1 to answer journalists' questions in natural language and emits a signed Claim Card.

The two layers communicate only through MCP, so the server can be swapped out or run standalone.

## How it works

```
user question
    ↓
[router]      LLM identifies indicator + country + year range
    ↓ search_indicators()
[MCP tools]   POST /data360/searchv2  → confirm indicator ID
    ↓ get_data() + get_metadata()
[MCP tools]   GET /data360/data       → verified time series
    ↓
[agent]       LLM writes answer using real data + source citation
    ↓
[card]        SHA-256 hash + ISO 8601 timestamp + Claim Card HTML
    ↓
verified answer + embeddable card + shareable URL
```

## The Claim Card

Every answer auto-generates an embeddable web component (think YouTube embed, but for verified data):

```
📊 VERIFIED DATA · World Bank Data360
Female labor force participation in Argentina grew from 42.1% to 47.3%
between 2014 and 2024 — an increase of 5.2 percentage points.

Indicator: SL.TLF.CACT.FE.ZS  |  Source: World Bank Data360  |  Verified: 2026-03-03
[ View raw data → data360.worldbank.org ]  [ ✓ Hash: a3f9d2c1 ]  [ verifacta.io/c/a3f9d2c1 ]
```

- **Frozen mode** — publishes the value as it was at write time (historical transparency)
- **Live mode** — widget always shows the latest World Bank value
- **Immutability notice** — if the World Bank revises a series, the card shows "at publication time the value was X, current value is Y"
- **Open Graph preview** — the URL generates automatic previews on Twitter, WhatsApp, etc.
- **Public auditability** — any reader can reproduce the exact query (original question, indicator used, endpoint called, timestamp)

## APIs used

| API | Role | Base URL | Auth |
|---|---|---|---|
| **Data360** (beta) | Primary — search, data, metadata, disaggregation | `https://data360api.worldbank.org` | None |
| **Indicators v2** (stable) | Fallback for time series when Data360 fails | `https://api.worldbank.org/v2` | None |

The MCP server uses both transparently. Priority Data360 databases for v1: WDI (2), Gender Statistics (14), Health Nutrition & Population (16), Global Findex (28), ESG Data (75), Global Economic Monitor (15).

## Tech stack

| Layer | Tech |
|---|---|
| Agent orchestration | LangGraph (Python) |
| MCP server | Python + MCP Protocol (FastMCP) |
| LLM | Claude Sonnet 4.6 (swappable) |
| Backend (planned) | FastAPI |
| UI (planned) | Chainlit |
| Observability (planned) | Langfuse (tracing, eval, prompt versioning) |
| Deploy (planned) | Railway or Render |
| Provenance | SHA-256 + ISO 8601 timestamp |
| Claim Card | Static HTML (web component planned) |

## Quick start

Requires Python 3.11+ and an `ANTHROPIC_API_KEY` ([get one here](https://console.anthropic.com/settings/keys)).

```bash
# 1. Activate the shared venv
source .venv/bin/activate

# 2. Install both packages (editable)
pip install -e ./mcp_server -e ./langgraph_agent

# 3. Configure your API key
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY

# 4. Run a query end-to-end (the agent spawns the MCP server automatically)
python langgraph_agent/agent.py "What is the GDP per capita of Argentina from 2015 to 2022?"
```

The agent prints the verified answer plus an integrity hash, and writes the Claim Card to `langgraph_agent/claim_card_prototype.html`.

To run the MCP server standalone (e.g. with the MCP Inspector or a different client):

```bash
python mcp_server/server.py
# or: mcp dev mcp_server/server.py
```

## Status

Verifacta is a **prototype for Phase 2 of the [DATA 360 Global Challenge 2026](https://www.worldbank.org/)**, organized by the World Bank and Media Party. Phase 2 runs through May 31, 2026.

Current state: MCP server with 2 of 5 planned tools (`search_indicators`, `get_data`), agent with end-to-end happy path, static Claim Card HTML. UI, deploy, and observability are next.

## License

MIT — see [mcp_server/LICENSE](mcp_server/LICENSE).
