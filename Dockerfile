FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# git: data360-mcp pulls `draco` from a git URL, and we also clone the MCP
# itself below. build-essential covers wheel builds for native deps that
# don't ship a manylinux wheel on Python 3.12-slim.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Verifacta deps. pyproject only at this layer so source edits don't
#    bust this cache.
COPY langgraph_agent/pyproject.toml ./langgraph_agent/
RUN pip install --upgrade pip && pip install -e ./langgraph_agent

# 2) Data360 MCP server, bundled in-container and spawned over stdio by the
#    agent (no separate Railway service). Pinned to `dev`, the upstream
#    default branch.
RUN git clone --depth 1 --branch dev https://github.com/worldbank/data360-mcp.git /opt/data360-mcp \
    && pip install -e /opt/data360-mcp

# Tell the agent to spawn the MCP as a stdio subprocess instead of the
# default HTTP transport. DATA360_API_BASE_URL is required by the MCP's
# pydantic-settings config; MCP_ENV=local skips the Azure App Insights
# log handler the MCP otherwise tries to wire up at startup.
ENV DATA360_MCP_TRANSPORT=stdio \
    DATA360_MCP_SERVER_PY=/opt/data360-mcp/src/data360/server.py \
    DATA360_API_BASE_URL=https://data360api.worldbank.org \
    MCP_ENV=local

# 3) Application code last so dev edits don't invalidate the dep layers.
COPY langgraph_agent/ ./langgraph_agent/

EXPOSE 8000
CMD uvicorn api:app --app-dir langgraph_agent --host 0.0.0.0 --port ${PORT:-8000}
