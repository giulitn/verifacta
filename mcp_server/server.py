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
        Search results from Data360. Each hit's `series_description` contains
        the `database_id` and `idno` (the indicator code) that get_data needs.
    """
    clean_query = validators.require_query(query)
    return await http_client.post_json(
        config.DATA360_SEARCH_URL, json={"search": clean_query}
    )


@mcp.tool()
async def get_data(
    database_id: str,
    indicator: str,
    country: str,
    year_start: int,
    year_end: int,
) -> dict:
    """Retrieve a time series from World Bank Data360.

    Args:
        database_id: Data360 database identifier (e.g. 'WB_WDI', 'WB_SSGD').
                     Required by the API. Find it in a search hit's
                     `series_description.database_id` field.
        indicator:   Data360 indicator code (e.g. 'WB_SSGD_GDP_CAPITA_PPP').
                     Find it in a search hit's `series_description.idno`
                     field (or strip the 'META_' prefix from the hit `id`).
        country:     ISO 3166-1 alpha-3 country code (e.g. 'ARG').
        year_start:  First year of the range (inclusive, >= 1960).
        year_end:    Last year of the range (inclusive, <= 2100).

    Returns:
        JSON response from the Data360 data API.
    """
    clean_database = validators.require_non_empty_str(database_id, "database_id")
    clean_indicator = validators.require_non_empty_str(indicator, "indicator")
    clean_country = validators.require_non_empty_str(country, "country")
    start, end = validators.require_year_range(year_start, year_end)
    return await http_client.get_json(
        config.DATA360_DATA_URL,
        params={
            "DATABASE_ID": clean_database,
            "INDICATOR": clean_indicator,
            "REF_AREA": clean_country,
            "timePeriodFrom": start,
            "timePeriodTo": end,
        },
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
