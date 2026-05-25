FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install Python deps first to leverage Docker layer cache.
COPY langgraph_agent/pyproject.toml ./langgraph_agent/
RUN pip install --upgrade pip && pip install -e ./langgraph_agent

# Copy the actual application code last so source edits don't bust the
# dependency layer.
COPY langgraph_agent/ ./langgraph_agent/

EXPOSE 8000

# Railway injects PORT at runtime; fall back to 8000 for local `docker run`.
# Shell form is required for ${PORT} substitution.
CMD uvicorn api:app --app-dir langgraph_agent --host 0.0.0.0 --port ${PORT:-8000}
