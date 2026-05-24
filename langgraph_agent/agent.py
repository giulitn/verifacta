"""Verifacta agent — entry point.

Wires the LangGraph ReAct agent to the MCP server over stdio, runs the
query, and emits a signed Claim Card. Side modules own validation,
prompts, and rendering — this file is orchestration only.

Usage:
    python langgraph_agent/agent.py "What is the GDP per capita of Argentina from 2015 to 2022?"
"""

import asyncio
import sys
from datetime import datetime, timezone

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

import claim_card
import config
import prompts


def _extract_indicator(messages: list) -> str:
    """Return the indicator used in the first `get_data` tool call, or 'N/A'."""
    for msg in messages:
        for tool_call in getattr(msg, "tool_calls", []):
            if tool_call.get("name") == "get_data":
                return tool_call.get("args", {}).get("indicator", "N/A")
    return "N/A"


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
    config.require_anthropic_key()

    async with MultiServerMCPClient(
        {
            "verifacta": {
                "command": sys.executable,
                "args": [config.MCP_SERVER_PATH],
                "transport": "stdio",
            }
        }
    ) as client:
        tools = client.get_tools()
        model = ChatAnthropic(
            model=config.MODEL_NAME, temperature=config.MODEL_TEMPERATURE
        )
        agent = create_react_agent(model, tools, state_modifier=prompts.SYSTEM_PROMPT)

        print(f"\n[Verifacta] Query: {user_query}\n")
        result = await agent.ainvoke({"messages": [HumanMessage(content=user_query)]})

    messages = result["messages"]
    answer = _coerce_answer(messages[-1].content)
    indicator = _extract_indicator(messages)
    timestamp = datetime.now(timezone.utc).isoformat()
    sha256 = claim_card.compute_hash(answer, indicator, timestamp)

    print("=" * 60)
    print(answer)
    print("=" * 60)
    print(f"Indicator ID : {indicator}")
    print(f"Timestamp    : {timestamp}")
    print(f"SHA-256      : {sha256}")

    config.CLAIM_CARD_OUTPUT.write_text(
        claim_card.render(answer, indicator, timestamp, sha256),
        encoding="utf-8",
    )
    print(f"\n[Verifacta] Claim card saved → {config.CLAIM_CARD_OUTPUT}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python agent.py "<your query>"')
        sys.exit(1)
    asyncio.run(run(sys.argv[1]))
