"""Static configuration for the Verifacta MCP server.

Single source of truth for endpoints and HTTP defaults.
"""

# --- Data360 (primary, beta) ----------------------------------------------
DATA360_BASE_URL = "https://data360api.worldbank.org"
DATA360_SEARCH_URL = f"{DATA360_BASE_URL}/data360/searchv2"
DATA360_DATA_URL = f"{DATA360_BASE_URL}/data360/data"
DATA360_DISAGGREGATION_URL = f"{DATA360_BASE_URL}/data360/disaggregation"

# `/data360/metadata` exists but ignores every filter param we probed and
# always returns the unfiltered set of 12,885 docs. `get_metadata` routes
# through DATA360_SEARCH_URL instead, since each search hit already carries
# the rich metadata block we need.

# --- Indicators v2 (stable fallback) --------------------------------------
INDICATORS_V2_BASE_URL = "https://api.worldbank.org/v2"

# --- HTTP defaults ---------------------------------------------------------
HTTP_TIMEOUT_SECONDS = 30

# --- Validation bounds -----------------------------------------------------
MIN_YEAR = 1960
MAX_YEAR = 2100
MAX_QUERY_LENGTH = 500
