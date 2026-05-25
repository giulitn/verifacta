# Verifacta

> A conversational, cryptographically-verifiable interface to World Bank data — built so journalists can use AI for data context without inheriting its misinformation.

## Why this exists

LLMs replicate state-sponsored disinformation. NewsGuard (2025) found that **33% of chatbot queries** reproduce content from contamination networks like Russia's *Pravda*, which seed propaganda specifically to poison model training data.

When journalists turn to ChatGPT or Gemini for context on economic or social statistics, they have no way to tell whether the number came from an official source or a contaminated one. That's the problem Verifacta solves.

## The solution

A conversational agent whose **only data source** is the World Bank's official Data360 catalogue. It is structurally impossible to contaminate, because it does not perform open web searches. Every answer is accompanied by a **Claim Card** — a cryptographically-signed, embeddable artifact that proves provenance and lets any reader reproduce the query independently.

## Architecture

Verifacta is built on top of the official **[World Bank Data360 MCP server](https://github.com/worldbank/data360-mcp)**, maintained by the *AI for Data — Data for AI* team at the World Bank Development Data Group. We consume it over HTTP and add a verification layer on top.

- **Data layer**: the official Data360 MCP exposes 15 tools (search, get_data, get_metadata, get_disaggregation, find_codelist_value, list_indicators, viz_spec, ranking, comparison, …) and 10 resources covering chain-of-thought prompts and codelists. Verifacta does **not** re-implement any of this.
- **Verification layer** (this repo): a LangGraph ReAct agent with anti-fabrication guardrails, journalist-oriented refusal UX, and a SHA-256-signed Claim Card per answer.

By building on the canonical Data360 MCP, Verifacta inherits all upstream improvements and stays aligned with how the World Bank itself recommends accessing the catalogue.

## How it works

```
user question
    ↓
[agent]       LangGraph ReAct loop with anti-fabrication guardrails
    ↓
[Data360 MCP] data360_search_indicators → data360_get_data
              data360_get_metadata, data360_get_disaggregation, …
    ↓
[agent]       Composes answer using ONLY tool-returned values, marks any
              derived calculation as "(calculated)", refuses cleanly when
              no indicator matches the query
    ↓
[card]        Collects every (database, indicator) pair cited,
              builds SHA-256 over answer + canonical citations + timestamp,
              renders one of two HTML variants:
                - claim_card.html      (verified — green badge, source list)
                - rejection_card.html  (refused — red badge, no citations)
    ↓
verified answer + embeddable card with cryptographic hash
```

## The Claim Card

Every answer auto-generates an embeddable web component (think YouTube embed, but for verified data):

```
📊 VERIFIED · World Bank Data360
GDP per capita of Argentina in 2022 was USD 13,621.

Sources consulted (1):
  WB_WDI :: WB_WDI_NY_GDP_PCAP_CD

Timestamp: 2026-05-25T14:19:43Z
SHA-256: 054378dcf9998624a0cf77cbe7a8ab941de9023f9d2a0fd54ec89946f83b0bef
```

Refused queries get a visually distinct **rejection card** (red border, "⚠ No verified data" badge) so a journalist can still cite *"Verifacta refused this question because…"* without confusing it with a verified answer.

- **Multi-source citations**: every distinct `(database, indicator)` pair the agent consulted is listed.
- **Deterministic hash**: SHA-256 of `answer + canonical_json(sorted_citations) + timestamp`. Any reader can recompute it from the displayed inputs.
- **Open Graph preview** (planned): the URL generates automatic previews on Twitter, WhatsApp, etc.
- **Public auditability**: any reader can reproduce the exact query (original question, indicator used, source database, timestamp).

## Tech stack

| Layer | Tech |
|---|---|
| Data tools (MCP) | Official [worldbank/data360-mcp](https://github.com/worldbank/data360-mcp), consumed over `streamable_http` |
| Agent orchestration | LangGraph (Python) via `langchain.agents.create_agent` |
| LLM | Provider-agnostic via `init_chat_model` — Anthropic Claude, Groq, Google Gemini, OpenAI |
| Provenance | SHA-256 + ISO 8601 timestamp |
| Claim Card | Static HTML (web component planned) |
| Backend (planned) | FastAPI |
| UI (planned) | Chainlit |
| Observability (planned) | Langfuse (tracing, eval, prompt versioning) |
| Deploy (planned) | Railway or Render |

## Quick start

Requires Python 3.11+, [`uv`](https://github.com/astral-sh/uv), and an API key from any supported LLM provider (default in `.env.example`: Anthropic).

### 1. Run the official Data360 MCP server (separate terminal)

```bash
git clone https://github.com/worldbank/data360-mcp.git ~/data360-mcp
cd ~/data360-mcp
cp .env.example .env  # the defaults work out of the box
uv sync
uv run poe serve --port 8000 --transport http
# → server listening at http://localhost:8000/mcp
```

Leave it running.

### 2. Run the Verifacta agent

```bash
cd ~/verifacta
source .venv/bin/activate
pip install -e ./langgraph_agent

cp .env.example .env
# edit .env: set ANTHROPIC_API_KEY (or another provider's key — see comments)

python langgraph_agent/agent.py "What is the GDP per capita of Argentina in 2022?"
```

The agent prints the verified answer plus the integrity hash, and writes the Claim Card to `langgraph_agent/claim_card_prototype.html`.

Switching providers: set `VERIFACTA_MODEL=<provider>:<model>` in `.env` and supply the matching `*_API_KEY`. Examples in `.env.example`.

## Status

Verifacta is a **prototype for Phase 2 of the [DATA 360 Global Challenge 2026](https://www.worldbank.org/)**, organized by the World Bank and Media Party. Phase 2 runs through May 31, 2026.

Current state: end-to-end working against the official Data360 MCP, with anti-fabrication guardrails, multi-indicator citation, and a refusal card variant validated across a 9-query benchmark. UI, deploy, and observability are next.

## License

MIT — see [LICENSE](LICENSE).
