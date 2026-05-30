# Verifacta

> A conversational, cryptographically-verifiable interface to World Bank data — built so journalists can use AI for data context without inheriting its misinformation.

## Why this exists

LLMs replicate state-sponsored disinformation. NewsGuard (2025) found that **33% of chatbot queries** reproduce content from contamination networks like Russia's *Pravda*, which seed propaganda specifically to poison model training data.

When journalists turn to ChatGPT or Gemini for context on economic or social statistics, they have no way to tell whether the number came from an official source or a contaminated one. That's the problem Verifacta solves.

## The solution

A conversational agent whose **only data source** is the World Bank's official Data360 catalogue. It is structurally impossible to contaminate, because it does not perform open web searches. Every answer is accompanied by a **Claim Card** — a cryptographically-signed, embeddable artifact that proves provenance and lets any reader reproduce the query independently.

## Architecture

Verifacta is built on top of the official **[World Bank Data360 MCP server](https://github.com/worldbank/data360-mcp)**, maintained by the *AI for Data — Data for AI* team at the World Bank Development Data Group. The MCP is consumed over `streamable_http` for local development and bundled as a stdio subprocess inside the deploy container for production. We add a verification layer on top.

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
| Data tools (MCP) | Official [worldbank/data360-mcp](https://github.com/worldbank/data360-mcp), `streamable_http` in dev and stdio-bundled in prod |
| Agent orchestration | LangGraph (Python) via `langchain.agents.create_agent` |
| LLM | Provider-agnostic via `init_chat_model` — OpenAI (default `gpt-5.4`), Anthropic Claude, Groq, Google Gemini, Cerebras |
| Provenance | SHA-256 + ISO 8601 timestamp + Claim Card permalink (`GET /c/{sha256}`) |
| Claim Card | Static HTML embed + persisted JSON for the permalink endpoint |
| Backend | FastAPI + slowapi + uvicorn (SSE streaming `/ask`) |
| UI | Next.js 15 (App Router), Tailwind, journalist-oriented chat |
| Observability | Datadog LLM Observability (agentless, custom span renamer) |
| Deploy | Vercel (frontend) + Railway single-container backend (Dockerfile bundles the MCP) |

## Quick start

The fastest way to see Verifacta in action is the hosted demo: **<https://verifacta.vercel.app>**. The sections below cover running it locally.

Requires Python 3.11+, [`uv`](https://github.com/astral-sh/uv), Node 20+, and an API key from any supported LLM provider.

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

### 2. Run the Verifacta agent (CLI)

```bash
cd ~/verifacta
source .venv/bin/activate
pip install -e ./langgraph_agent

cp .env.example .env
# edit .env: set VERIFACTA_MODEL=openai:gpt-5.4 + OPENAI_API_KEY
# (or any other provider — see comments in .env.example)

python langgraph_agent/agent.py "What is the GDP per capita of Argentina in 2022?"
```

The agent prints the verified answer plus the integrity hash, and writes the Claim Card to `langgraph_agent/claim_card_prototype.html`.

Switching providers: set `VERIFACTA_MODEL=<provider>:<model>` in `.env` and supply the matching `*_API_KEY`. Examples in `.env.example`.

### 3. (Optional) Run the API + web UI

```bash
# Terminal A — backend (Verifacta agent as an HTTP service)
cd ~/verifacta
source .venv/bin/activate
uvicorn api:app --app-dir langgraph_agent --reload --port 8001

# Terminal B — Next.js frontend
cd ~/verifacta/web
cp .env.example .env.local   # points at http://localhost:8001
npm install
npm run dev                  # → http://localhost:3000
```

For container-based deploys, the included `Dockerfile` builds a single image that bundles both the agent and the Data360 MCP server. See [`DEPLOY.md`](DEPLOY.md) for the Railway + Vercel topology used by the hosted demo.

## Status

Verifacta is the **Phase 2 submission for the [DATA 360 Global Challenge 2026](https://mediaparty.org/data-360/)**, organized by the World Bank and Media Party. Phase 2 closes on May 31, 2026.

Current state — submission-ready: the Verifacta agent runs end-to-end against the official Data360 MCP with the four anti-fabrication guardrails A–D, multi-indicator citation, and a refusal card variant. Hosted demo at <https://verifacta.vercel.app> (Next.js frontend on Vercel, single-container backend with the MCP bundled as a stdio subprocess on Railway). Datadog LLM Observability captures every agent run with a custom span renamer that turns generic `OpenAI.createChatCompletion` spans into a narrative of the agent's reasoning. The full documentation is in [`web/app/(docs)/`](web/app/\(docs\)/) — architecture, methodology, security, user guide, sustainability, and the Phase 2 development timeline / technical addendum.

## Documentation

The five jury-facing pages (rendered at the demo URL above):

- **[Architecture](https://verifacta.vercel.app/architecture)** — the system shape, request flow, and why each piece exists.
- **[Methodology](https://verifacta.vercel.app/methodology)** — the Data360 integration recipe, the SHA-256 Claim Card spec, and the anti-fabrication guardrails A–D.
- **[Security](https://verifacta.vercel.app/security)** — auth, rate limiting, and how the integrity contract stays intact.
- **[User guide](https://verifacta.vercel.app/user-guide)** — how a journalist uses Verifacta in under 30 seconds.
- **[Sustainability](https://verifacta.vercel.app/sustainability)** — the stack, the monthly cost, and the upstream contribution model.
- **[Timeline & addendum](https://verifacta.vercel.app/timeline)** — pre-existing dependencies vs. challenge-specific work, plus the Phase 2 development timeline.

## License

MIT — see [LICENSE](LICENSE).
