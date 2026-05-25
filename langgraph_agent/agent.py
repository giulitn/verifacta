"""Verifacta agent — entry point.

Wires the LangGraph ReAct agent to the official World Bank Data360 MCP
server (https://github.com/worldbank/data360-mcp) over streamable_http,
runs the query, and emits a signed Claim Card. Side modules own
configuration, prompts, and rendering — this file is orchestration only.

Usage:
    1. Start the Data360 MCP server in a separate terminal:
       cd ~/data360-mcp && uv run poe serve --port 8000 --transport http
    2. python langgraph_agent/agent.py "What is the GDP per capita of Argentina from 2015 to 2022?"
"""

import asyncio
import logging
import sys
from datetime import datetime, timezone

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient

import claim_card
import config
import logging_setup
import prompts

logger = logging.getLogger("verifacta")


# Tool calls that actually fetched data values (and therefore deserve a
# citation on the Claim Card). data360_get_metadata is excluded on purpose —
# it enriches an existing citation, it doesn't introduce a new data source.
# data360_get_timeseries is listed in anticipation of the upstream PR that
# adds an Indicators v2 fallback; it stays inert until that tool exists.
_V2_DATABASE_LABEL = "WB Indicators v2 (WDI)"


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


async def run(user_query: str) -> None:
    """Run the ReAct agent end-to-end and save the Claim Card."""
    config.require_provider_key()

    client = MultiServerMCPClient(
        {
            "data360": {
                "url": config.MCP_SERVER_URL,
                "transport": "streamable_http",
            }
        }
    )
    tools = await client.get_tools()
    model = init_chat_model(config.MODEL_NAME, temperature=config.MODEL_TEMPERATURE)
    agent = create_agent(model, tools, system_prompt=prompts.SYSTEM_PROMPT)

    logger.info("Query: %s", user_query)
    result = await agent.ainvoke({"messages": [HumanMessage(content=user_query)]})

    messages = result["messages"]
    answer = _coerce_answer(messages[-1].content)
    indicators = _collect_indicators(messages)
    timestamp = datetime.now(timezone.utc).isoformat()
    sha256 = claim_card.compute_hash(answer, indicators, timestamp)

    logger.info("=" * 60)
    logger.info("Answer: %s", answer)
    logger.info("=" * 60)
    if indicators:
        logger.info("Indicators   : %d cited", len(indicators))
        for c in indicators:
            logger.info("  - %s :: %s", c["database"], c["indicator"])
    else:
        logger.info("Indicators   : (none — query refused, no tool calls made)")
    logger.info("Timestamp    : %s", timestamp)
    logger.info("SHA-256      : %s", sha256)

    config.CLAIM_CARD_OUTPUT.write_text(
        claim_card.render(answer, indicators, timestamp, sha256),
        encoding="utf-8",
    )
    logger.info("Claim card saved -> %s", config.CLAIM_CARD_OUTPUT)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python agent.py "<your query>"')
        sys.exit(1)
    logging_setup.setup_logging(config.LOG_FILE)
    logger.info("Log file: %s", config.LOG_FILE)
    asyncio.run(run(sys.argv[1]))
