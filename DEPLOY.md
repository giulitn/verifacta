# Deployment guide

Verifacta is a two-tier deployment:

| Tier | Hosts | Platform | Cost |
|---|---|---|---|
| Frontend | `web/` Next.js app | Vercel | Free (Hobby) |
| Backend | `langgraph_agent/` FastAPI + bundled MCP subprocess | Railway | ~USD $5/mo (Hobby) |
| Traces | LangSmith / Langfuse (Phase 4) | Langfuse Cloud | Free (50k obs/mo) |

This guide covers Phase 0: a connectivity-check deploy with HTTP Basic Auth.
The agent itself is wired in Phase 1.

## Local development

You need Python 3.11+ and Node 20+.

```bash
# Backend
cd /Users/giuli/verifacta
source .venv/bin/activate
pip install -e ./langgraph_agent
uvicorn api:app --app-dir langgraph_agent --reload --port 8001
#                                                       ^^^^
# 8001 (not 8000) avoids colliding with the Data360 MCP server, which runs
# on 8000 per CLAUDE.md. In Phase 1 the MCP becomes a stdio subprocess and
# this distinction goes away.

# Frontend (separate terminal)
cd web
cp .env.example .env.local   # already points at http://localhost:8001
npm install
npm run dev                  # http://localhost:3000
```

The frontend should display `Reachable: yes` and the JSON body of `/health`.

## Production: Railway (backend)

1. Push the repo to GitHub if you haven't already.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick `verifacta`.
3. Railway auto-detects `Dockerfile` at the repo root and builds.
4. After the first build, open the service → **Settings → Networking → Generate Domain**. Note the URL (e.g. `https://verifacta-production.up.railway.app`).
5. **Settings → Variables**, add:
   - `ANTHROPIC_API_KEY` — your key (or whichever provider you're using)
   - `VERIFACTA_MODEL=anthropic:claude-sonnet-4-6` (or other)
   - `FRONTEND_ORIGIN` — the Vercel URL once you have it (you'll come back to set this)
   - `RATE_LIMIT` — optional, defaults to `30/hour`. Uses [slowapi syntax](https://slowapi.readthedocs.io/en/latest/): `"<count>/<period>"` or a semicolon-joined list like `"30/hour;5/minute"`. Per client IP (X-Forwarded-For aware).
6. Healthcheck is `/health` (already configured in `railway.json`).

## Production: Vercel (frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import `verifacta`.
2. **Root Directory**: set to `web` (this is the critical monorepo setting — without it Vercel will try to build from the repo root and fail).
3. **Framework Preset**: Next.js (auto-detected).
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` — the Railway URL from above (no trailing slash)
   - `JURY_USER` — pick a username for the jury login
   - `JURY_PASS` — pick a strong password
5. Deploy. Once you have the Vercel URL, **go back to Railway** and set `FRONTEND_ORIGIN` to that URL, then redeploy the backend (CORS).

## Verifying the deploy

```bash
# Backend reachable, no auth needed
curl https://your-app.up.railway.app/health
# → {"status":"ok","service":"verifacta","phase":"0"}

# Frontend requires Basic Auth
curl -u jury:your-pass https://verifacta.vercel.app
```

Visit the Vercel URL in a browser → it should prompt for the jury credentials, then render the connectivity-check page.

## Troubleshooting

- **Frontend says "Reachable: no"** → check CORS. Backend `FRONTEND_ORIGIN` must exactly match the Vercel URL (scheme + host, no trailing slash).
- **Railway build fails on `pip install`** → verify `langgraph_agent/pyproject.toml` is committed and the Dockerfile points at it.
- **Vercel build fails with "No Next.js version detected"** → you forgot to set Root Directory to `web`.
- **Browser doesn't prompt for auth** → confirm `JURY_USER` and `JURY_PASS` are set in Vercel env vars (Production scope).

## What's still manual

Phase 0 doesn't yet wire:
- The actual agent (Phase 1 — refactors `agent.py` to expose `run_agent` as an async iterator and adds `/ask` with SSE streaming).
- Rate limiting (Phase 3).
- Langfuse traces (Phase 4).
- The MDX documentation pages (Phase 5).
