"""Datadog LLM Observability hook for the agent.

Wraps each agent run in an `LLMObs.workflow` span and annotates it with
the Claim Card metadata (SHA-256, indicators cited) at the end.

Configuration via environment variables:

    DD_API_KEY                       required to enable
    DD_SITE                          datadoghq.com (US1, default), datadoghq.eu, …
    DD_LLMOBS_ML_APP                 ML app name in Datadog (default: "verifacta")
    DD_LLMOBS_AGENTLESS_ENABLED      "true" when no Datadog Agent runs on the
                                     host (Railway, Vercel, local Mac). Required
                                     for our deploy topology.
"""

import os

# Skip ddtrace's auto-patching of LangChain and LangGraph. Both their 4.10
# integrations capture the full RunnableConfig — including the runtime
# `AsyncCallbackManager` callbacks list — into LLM Obs span metadata,
# which then fails json-serialization in the trace writer and prevents
# *any* telemetry from being sent. We rely on our own manual
# `LLMObs.workflow()` span instead, which records the Claim Card
# metadata cleanly; the tradeoff is that we lose ddtrace's per-call
# token/latency auto-tracing. APM tracer stays enabled so LLM Obs spans
# flow through the standard pipeline.
os.environ.setdefault("DD_PATCH_MODULES", "langchain:false,langgraph:false")

import logging
from contextlib import contextmanager
from typing import Any, Iterator, Optional

logger = logging.getLogger("verifacta.observability")

_enabled = False
_initialized = False


def _try_init() -> None:
    """Best-effort init. Runs at most once per process."""
    global _enabled, _initialized
    if _initialized:
        return
    _initialized = True

    if not os.environ.get("DD_API_KEY"):
        logger.info("Datadog LLM Observability disabled (DD_API_KEY unset)")
        return

    try:
        from ddtrace.llmobs import LLMObs
    except ImportError:
        logger.warning("ddtrace not installed; LLM observability disabled")
        return

    ml_app = os.environ.get("DD_LLMOBS_ML_APP", "verifacta")
    # Agentless mode talks to Datadog's HTTP intake directly. Required when
    # there's no Datadog Agent on the host — which is the case on Railway,
    # Vercel, and on a vanilla developer Mac.
    agentless = os.environ.get(
        "DD_LLMOBS_AGENTLESS_ENABLED", "true"
    ).strip().lower() in ("1", "true", "yes")
    try:
        LLMObs.enable(ml_app=ml_app, agentless_enabled=agentless)
        _register_span_renamer()
        _enabled = True
        logger.info(
            "Datadog LLM Observability enabled (ml_app=%s, site=%s, agentless=%s)",
            ml_app,
            os.environ.get("DD_SITE", "datadoghq.com"),
            agentless,
        )
    except Exception:
        logger.exception("Datadog LLM Observability init failed")


def _register_span_renamer() -> None:
    """Register a trace processor that renames each OpenAI LLM span with a
    description of what the model decided to do in that step.

    Without this, every LLM call in the trace shows up as the generic
    "OpenAI.createChatCompletion". With it, the names read like a
    narrative of the agent's reasoning:

        Decide: call data360_find_codelist_value
        Decide: call data360_search_indicators
        Decide: call data360_get_data
        Synthesize final answer

    The renamer reads the LLM Obs output messages stored on the span's
    `_meta_struct["_llmobs"]` field, which is populated by ddtrace's
    OpenAI integration before the trace is exported.
    """
    from ddtrace import tracer
    from ddtrace.trace import TraceFilter

    class _DescribeLLMSpans(TraceFilter):
        def process_trace(self, trace):
            for span in trace:
                try:
                    self._maybe_rename(span)
                except Exception:
                    # Best-effort renaming — never break trace export.
                    pass
            return trace

        @staticmethod
        def _maybe_rename(span) -> None:
            meta_struct = getattr(span, "_meta_struct", None)
            if not meta_struct:
                return
            llmobs = meta_struct.get("_llmobs")
            if not llmobs:
                return
            if llmobs.get("tags", {}).get("integration") != "openai":
                return
            output = llmobs.get("meta", {}).get("output", {})
            messages = output.get("messages") or []
            if not messages:
                return
            first_msg = messages[0] if isinstance(messages, list) else {}
            tool_calls = first_msg.get("tool_calls") or []
            if tool_calls:
                tool_name = tool_calls[0].get("name")
                if tool_name:
                    llmobs["name"] = f"Decide: call {tool_name}"
                    return
            llmobs["name"] = "Synthesize final answer"

    tracer.configure(trace_processors=[_DescribeLLMSpans()])


@contextmanager
def workflow(name: str) -> Iterator[None]:
    """Wrap an agent run as one LLM Obs workflow span. No-op when disabled."""
    _try_init()
    if not _enabled:
        yield
        return
    from ddtrace.llmobs import LLMObs

    with LLMObs.workflow(name=name):
        yield


def annotate(
    *,
    metadata: Optional[dict] = None,
    tags: Optional[dict] = None,
    input_data: Any = None,
    output_data: Any = None,
) -> None:
    """Attach metadata/tags to the currently active LLM Obs span.

    Used after the agent finishes to record the SHA-256 hash, the
    indicators cited, and whether the run was a refusal — fields we
    don't know until the run completes.
    """
    _try_init()
    if not _enabled:
        return
    try:
        from ddtrace.llmobs import LLMObs

        LLMObs.annotate(
            metadata=metadata,
            tags=tags,
            input_data=input_data,
            output_data=output_data,
        )
    except Exception:
        logger.exception("Failed to annotate Datadog LLM Obs span")


def flush() -> None:
    """Force pending spans/events to flush. Useful before process exit."""
    _try_init()
    if not _enabled:
        return
    try:
        from ddtrace.llmobs import LLMObs

        LLMObs.flush()
    except Exception:
        logger.exception("Failed to flush Datadog LLM Obs")


# Eager init at import time so ddtrace patches LangChain/LangGraph before
# the agent first uses them. agent.py imports this module before langchain
# to take full advantage of the patching.
_try_init()
