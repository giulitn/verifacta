"""Verifacta agent — orchestration.

Two consumers share the same agent core:
  - run_agent_stream(query) yields events for the FastAPI /ask endpoint
    (SSE streaming) and for tests.
  - run_cli(query) is the legacy CLI entry point. It consumes the stream
    and writes the Claim Card HTML to disk, preserving the prior behavior.

The agent connects to the official World Bank Data360 MCP either over
HTTP (local dev, MCP running on port 8000) or over stdio (production,
MCP bundled in the same container). See config.MCP_TRANSPORT.

CLI usage:
    python langgraph_agent/agent.py "What is the GDP per capita of Argentina in 2022?"
"""

import asyncio
import logging
import sys
from datetime import datetime, timezone
from typing import AsyncIterator, TypedDict

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient

import claim_card
import config
import logging_setup
import prompts

logger = logging.getLogger("verifacta")


class AgentEvent(TypedDict):
    """One event emitted during an agent run.

    Discriminated by `type`:
      - "tool_call_start" : {"name", "args", "id"}
      - "tool_call_end"   : {"id"}
      - "final_answer"    : {"text"}
      - "claim_card"      : {"answer", "indicators", "timestamp", "sha256"}
      - "error"           : {"message"}
    """

    type: str
    data: dict


# Tool calls that actually fetched data values (and therefore deserve a
# citation on the Claim Card). data360_get_metadata is excluded on purpose —
# it enriches an existing citation, it doesn't introduce a new data source.
_V2_DATABASE_LABEL = "WB Indicators v2 (WDI)"


def _build_mcp_client() -> MultiServerMCPClient:
    """Construct the MCP client for the configured transport."""
    if config.MCP_TRANSPORT == "stdio":
        return MultiServerMCPClient(
            {
                "data360": {
                    "command": config.MCP_STDIO_COMMAND,
                    "args": [
                        "run",
                        config.MCP_STDIO_SERVER_PY,
                        "--transport",
                        "stdio",
                    ],
                    "transport": "stdio",
                }
            }
        )
    return MultiServerMCPClient(
        {
            "data360": {
                "url": config.MCP_SERVER_URL,
                "transport": "streamable_http",
            }
        }
    )


def _collect_indicators(messages: list) -> list[dict]:
    """Walk the agent transcript and return all distinct data sources cited.

    Returns a list of `{"database": str, "indicator": str}` sorted for stable
    hashing. Each entry corresponds to a unique (database, indicator) pair
    consulted across data-fetching tool calls.
    """
    seen: set[tuple[str, str]] = set()
    citations: list[dict] = []
    for msg in messages:
        for tool_call in getattr(msg, "tool_calls", []):
            name = tool_call.get("name")
            args = tool_call.get("args") or {}
            if name == "data360_get_data":
                indicator = args.get("indicator_id")
                database = args.get("database_id")
            elif name == "data360_get_timeseries":
                indicator = args.get("indicator") or args.get("indicator_id")
                database = _V2_DATABASE_LABEL
            else:
                continue
            if not indicator or not database:
                continue
            key = (database, indicator)
            if key in seen:
                continue
            seen.add(key)
            citations.append({"database": database, "indicator": indicator})
    citations.sort(key=lambda c: (c["database"], c["indicator"]))
    return citations


def _coerce_answer(content) -> str:
    """Normalize AIMessage content to a plain string."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        # Claude extended-thinking returns a list of typed blocks.
        return " ".join(
            block.get("text", "") for block in content if isinstance(block, dict)
        )
    return str(content)


def _events_from_new_message(msg) -> list[AgentEvent]:
    """Translate one freshly-appended LangGraph message into UI events.

    AIMessages with tool_calls produce one `tool_call_start` per tool call.
    ToolMessages produce one `tool_call_end`. Plain AIMessages with the
    final answer produce nothing here — `run_agent_stream` emits the
    `final_answer` and `claim_card` events after the stream ends, so it
    can compute the integrity hash over the complete transcript.
    """
    events: list[AgentEvent] = []
    for tool_call in getattr(msg, "tool_calls", []) or []:
        events.append(
            {
                "type": "tool_call_start",
                "data": {
                    "name": tool_call.get("name", ""),
                    "args": tool_call.get("args") or {},
                    "id": tool_call.get("id", ""),
                },
            }
        )
    if msg.__class__.__name__ == "ToolMessage":
        events.append(
            {
                "type": "tool_call_end",
                "data": {"id": getattr(msg, "tool_call_id", "")},
            }
        )
    return events


async def run_agent_stream(user_query: str) -> AsyncIterator[AgentEvent]:
    """Run the ReAct agent and yield events in real time.

    Tool calls are emitted as they happen so the UI can render the
    agent's reasoning live. The synthesized answer and signed Claim Card
    are emitted last, after the integrity hash has been computed.
    """
    config.require_provider_key()

    client = _build_mcp_client()
    tools = await client.get_tools()
    model = init_chat_model(config.MODEL_NAME, temperature=config.MODEL_TEMPERATURE)
    agent = create_agent(model, tools, system_prompt=prompts.SYSTEM_PROMPT)

    logger.info("Query: %s", user_query)

    messages: list = []
    emitted_count = 0
    async for state in agent.astream(
        {"messages": [HumanMessage(content=user_query)]},
        stream_mode="values",
    ):
        messages = state.get("messages", [])
        for new_msg in messages[emitted_count:]:
            for event in _events_from_new_message(new_msg):
                yield event
        emitted_count = len(messages)

    if not messages:
        yield {
            "type": "error",
            "data": {"message": "Agent produced no messages"},
        }
        return

    answer = _coerce_answer(messages[-1].content)
    indicators = _collect_indicators(messages)
    timestamp = datetime.now(timezone.utc).isoformat()
    sha256 = claim_card.compute_hash(answer, indicators, timestamp)

    yield {"type": "final_answer", "data": {"text": answer}}
    yield {
        "type": "claim_card",
        "data": {
            "answer": answer,
            "indicators": indicators,
            "timestamp": timestamp,
            "sha256": sha256,
        },
    }


async def run_cli(user_query: str) -> None:
    """CLI entry point — consume the stream, log it, write Claim Card HTML.

    Preserves the legacy behavior of the previous `run()` function: a
    single HTML file is written to `config.CLAIM_CARD_OUTPUT` and a human
    summary is logged.
    """
    card: dict | None = None
    async for event in run_agent_stream(user_query):
        kind = event["type"]
        data = event["data"]
        if kind == "tool_call_start":
            logger.info("→ %s(%s)", data["name"], data["args"])
        elif kind == "tool_call_end":
            logger.info("← tool returned")
        elif kind == "claim_card":
            card = data
        elif kind == "error":
            logger.error("Agent error: %s", data["message"])
            return

    if card is None:
        logger.error("Agent stream ended without producing a Claim Card")
        return

    logger.info("=" * 60)
    logger.info("Answer: %s", card["answer"])
    logger.info("=" * 60)
    if card["indicators"]:
        logger.info("Indicators   : %d cited", len(card["indicators"]))
        for citation in card["indicators"]:
            logger.info("  - %s :: %s", citation["database"], citation["indicator"])
    else:
        logger.info("Indicators   : (none — query refused, no tool calls made)")
    logger.info("Timestamp    : %s", card["timestamp"])
    logger.info("SHA-256      : %s", card["sha256"])

    config.CLAIM_CARD_OUTPUT.write_text(
        claim_card.render(
            card["answer"], card["indicators"], card["timestamp"], card["sha256"]
        ),
        encoding="utf-8",
    )
    logger.info("Claim card saved -> %s", config.CLAIM_CARD_OUTPUT)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python agent.py "<your query>"')
        sys.exit(1)
    logging_setup.setup_logging(config.LOG_FILE)
    logger.info("Log file: %s", config.LOG_FILE)
    asyncio.run(run_cli(sys.argv[1]))
