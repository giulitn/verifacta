"""Reusable input validators for MCP tools.

Each helper has a single responsibility and raises the standard Python
exceptions (TypeError for wrong type, ValueError for wrong value) so the
MCP framework surfaces a clear error to the caller.
"""

from config import MAX_QUERY_LENGTH, MAX_YEAR, MIN_YEAR


def require_non_empty_str(value: object, field: str, max_length: int | None = None) -> str:
    """Return `value` stripped, or raise if it's not a usable string."""
    if not isinstance(value, str):
        raise TypeError(f"{field} must be a string")
    stripped = value.strip()
    if not stripped:
        raise ValueError(f"{field} must not be empty")
    if max_length is not None and len(stripped) > max_length:
        raise ValueError(f"{field} must not exceed {max_length} characters")
    return stripped


def require_query(value: object) -> str:
    """Validate a free-text search query."""
    return require_non_empty_str(value, "query", max_length=MAX_QUERY_LENGTH)


def require_year_range(year_start: object, year_end: object) -> tuple[int, int]:
    """Validate a (start, end) year pair against the Data360 bounds."""
    for name, year in (("year_start", year_start), ("year_end", year_end)):
        if not isinstance(year, int) or isinstance(year, bool):
            raise TypeError(f"{name} must be an integer")
        if not (MIN_YEAR <= year <= MAX_YEAR):
            raise ValueError(f"{name} must be between {MIN_YEAR} and {MAX_YEAR}")
    if year_start > year_end:  # type: ignore[operator]
        raise ValueError("year_start must be less than or equal to year_end")
    return year_start, year_end  # type: ignore[return-value]
