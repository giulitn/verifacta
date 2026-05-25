/**
 * Map raw Data360 MCP tool names to copy a journalist can read.
 *
 * Keep in sync with langgraph_agent/prompts.py — every tool the agent
 * can call should have a label. Unmapped names fall back to "Procesando…".
 */

const RUNNING_LABELS: Record<string, string> = {
  data360_search_indicators: "Buscando indicadores relevantes…",
  data360_get_data: "Consultando datos oficiales…",
  data360_get_metadata: "Revisando metadata del indicador…",
  data360_get_disaggregation: "Analizando dimensiones disponibles…",
  data360_find_codelist_value: "Resolviendo códigos de país…",
  data360_get_timeseries: "Consultando serie histórica…",
  data360_list_indicators: "Listando indicadores…",
};

const DONE_LABELS: Record<string, string> = {
  data360_search_indicators: "Indicadores identificados",
  data360_get_data: "Datos obtenidos",
  data360_get_metadata: "Metadata revisada",
  data360_get_disaggregation: "Dimensiones analizadas",
  data360_find_codelist_value: "Códigos resueltos",
  data360_get_timeseries: "Serie histórica obtenida",
  data360_list_indicators: "Indicadores listados",
};

export function runningLabel(toolName: string): string {
  return RUNNING_LABELS[toolName] ?? "Procesando…";
}

export function doneLabel(toolName: string): string {
  return DONE_LABELS[toolName] ?? "Procesado";
}
