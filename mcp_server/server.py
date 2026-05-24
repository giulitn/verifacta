"""Verifacta MCP Server.

Registers tools that expose the World Bank Data360 API over stdio.
Tool bodies are intentionally thin — validation, HTTP, and configuration
live in sibling modules.
"""

from typing import Any
from urllib.parse import quote

from mcp.server.fastmcp import FastMCP

import config
import http_client
import validators

mcp = FastMCP("verifacta-mcp")

_SEARCH_RESULT_LIMIT = 10


def _summarize_search_hit(hit: dict) -> dict:
    """Project a raw Azure Search hit down to the fields the agent actually needs.

    The raw payload averages 16 KB per hit (60+ fields including methodology,
    definition_long, derivation, etc.). For indicator selection the agent only
    needs identity, naming, and a one-line description; rich provenance lives
    in get_metadata.
    """
    sd = hit.get("series_description") or {}
    md = hit.get("metadata_information") or {}
    raw_id = hit.get("id") or ""
    idno = sd.get("idno") or (
        raw_id.removeprefix("META_") if raw_id.startswith("META_") else None
    )
    return {
        "id": hit.get("id"),
        "idno": idno,
        "database_id": sd.get("database_id"),
        "database_name": sd.get("database_name"),
        "name": sd.get("name"),
        "title": md.get("title"),
        "definition_short": sd.get("definition_short"),
        "periodicity": sd.get("periodicity"),
    }


@mcp.tool()
async def search_indicators(query: str) -> dict:
    """Search World Bank Data360 indicators by keyword.

    Returns a slim catalogue listing (top 10 hits, ~8 fields each) so the
    response fits in any model's context window. For the full provenance
    document of a chosen indicator (methodology, producers, version, etc.),
    use `get_metadata` afterwards.

    Args:
        query: Free-text keyword to search for relevant indicators.

    Returns:
        `{"results": [{id, idno, database_id, database_name, name, title,
        definition_short, periodicity}, ...], "total_matches": int,
        "results_returned": int}`. Use `idno` as the indicator code for
        `get_data` and `database_id` as its database.
    """
    clean_query = validators.require_query(query)
    raw = await http_client.post_json(
        config.DATA360_SEARCH_URL, json={"search": clean_query}
    )
    hits = raw.get("value", []) or []
    return {
        "results": [_summarize_search_hit(h) for h in hits[:_SEARCH_RESULT_LIMIT]],
        "total_matches": raw.get("@odata.count") or len(hits),
        "results_returned": min(len(hits), _SEARCH_RESULT_LIMIT),
    }


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


@mcp.tool()
async def get_metadata(indicator: str) -> dict:
    """Retrieve rich provenance metadata for a Data360 indicator.

    Returns the indicator's full metadata document — title, producers,
    methodology, definition, periodicity, version, source disclosure, etc.
    Use this to cite the source properly in the final answer.

    Args:
        indicator: Data360 indicator code (e.g. 'WB_SSGD_GDP_CAPITA_PPP').
                   This is the `series_description.idno` value from a
                   search_indicators hit.

    Returns:
        The matching metadata document, or `{"error": "..."}` if no exact
        match for `META_<indicator>` was found.
    """
    clean = validators.require_non_empty_str(indicator, "indicator")
    response = await http_client.post_json(
        config.DATA360_SEARCH_URL, json={"search": clean}
    )
    expected_id = f"META_{clean}"
    for hit in response.get("value", []):
        if hit.get("id") == expected_id:
            return hit
    return {"error": f"No metadata document found for indicator '{clean}'."}


@mcp.tool()
async def get_disaggregation(database_id: str, indicator: str) -> Any:
    """List the dimensions an indicator can be sliced by (REF_AREA, SEX, AGE, ...).

    Returns each disaggregation field with its label and the list of
    valid values currently observed in the data. Use this before calling
    `get_data` when the user asks for a breakdown (e.g. "by gender", "for
    countries X, Y, Z").

    Args:
        database_id: Data360 database identifier (e.g. 'WB_WDI').
        indicator:   Data360 indicator code (e.g. 'WB_WDI_FP_CPI_TOTL_ZG').

    Returns:
        A list of dimension objects with `field_name`, `label_name`,
        and `field_value` (the list of allowed values).
    """
    clean_db = validators.require_non_empty_str(database_id, "database_id")
    clean_ind = validators.require_non_empty_str(indicator, "indicator")
    return await http_client.get_json(
        config.DATA360_DISAGGREGATION_URL,
        params={"datasetId": clean_db, "indicatorId": clean_ind},
    )


@mcp.tool()
async def get_timeseries(
    country: str,
    indicator: str,
    year_start: int,
    year_end: int,
) -> Any:
    """Retrieve a time series from the stable Indicators v2 API (fallback for Data360).

    Use this when `get_data` fails or returns nothing, OR when you want
    the canonical World Development Indicators series. The v2 API uses
    a different ID format than Data360.

    Args:
        country:    ISO 3166-1 alpha-2 or alpha-3 country code (e.g. 'AR' or 'ARG').
        indicator:  Classic WB indicator code in dotted form (e.g. 'SP.POP.TOTL',
                    'NY.GDP.PCAP.CD', 'FP.CPI.TOTL.ZG'). NOT the Data360 underscored
                    form — for WDI indicators, strip the 'WB_WDI_' prefix and replace
                    underscores with dots.
        year_start: First year of the range (inclusive, >= 1960).
        year_end:   Last year of the range (inclusive, <= 2100).

    Returns:
        A two-element list `[metadata, data_points]` per the v2 API contract.
        `data_points` contains records with `date`, `value`, `country`, `indicator`.
    """
    clean_country = validators.require_non_empty_str(country, "country")
    clean_indicator = validators.require_non_empty_str(indicator, "indicator")
    start, end = validators.require_year_range(year_start, year_end)
    url = (
        f"{config.INDICATORS_V2_BASE_URL}"
        f"/country/{quote(clean_country, safe='')}"
        f"/indicator/{quote(clean_indicator, safe='')}"
    )
    return await http_client.get_json(
        url, params={"format": "json", "date": f"{start}:{end}"}
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
