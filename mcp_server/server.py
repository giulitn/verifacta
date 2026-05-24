"""Verifacta MCP Server.

Registers tools that expose the World Bank Data360 API over stdio.
Tool bodies are intentionally thin — validation, HTTP, and configuration
live in sibling modules.
"""

from mcp.server.fastmcp import FastMCP

import config
import http_client
import validators

mcp = FastMCP("verifacta-mcp")


@mcp.tool()
async def search_indicators(query: str) -> dict:
    """Search World Bank Data360 indicators by keyword.

    Args:
        query: Free-text keyword to search for relevant indicators.

    Returns:
        JSON response from the Data360 search API.
    """
    clean_query = validators.require_query(query)
    return await http_client.post_json(
        config.DATA360_SEARCH_URL, json={"query": clean_query}
    )


@mcp.tool()
async def get_data(
    indicator: str,
    country: str,
    year_start: int,
    year_end: int,
) -> dict:
    """Retrieve a time series from World Bank Data360.

    Args:
        indicator: Data360 indicator code (e.g. 'SP.POP.TOTL').
        country:   ISO 3166-1 alpha-3 country code (e.g. 'ARG').
        year_start: First year of the range (inclusive, >= 1960).
        year_end:   Last year of the range (inclusive, <= 2100).

    Returns:
        JSON response from the Data360 data API.
    """
    clean_indicator = validators.require_non_empty_str(indicator, "indicator")
    clean_country = validators.require_non_empty_str(country, "country")
    start, end = validators.require_year_range(year_start, year_end)
    return await http_client.get_json(
        config.DATA360_DATA_URL,
        params={
            "indicator": clean_indicator,
            "country": clean_country,
            "yearStart": start,
            "yearEnd": end,
        },
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
