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

// One-line periodistic explanation of what each step means for a
// non-technical reader. Shown as a subtle subtitle under the step label.
const HELPER_LABELS: Record<string, string> = {
  data360_search_indicators:
    "Le preguntamos al catálogo del Banco Mundial qué indicador oficial responde tu pregunta.",
  data360_get_data:
    "Bajamos los números reales para los años y país que pediste, directo de la API.",
  data360_get_metadata:
    "Leemos quién publicó el indicador, cómo se calcula y desde cuándo existe.",
  data360_get_disaggregation:
    "Vemos por qué dimensiones se puede filtrar el dato (sexo, edad, urbano/rural).",
  data360_find_codelist_value:
    "Traducimos un nombre a su código oficial (Argentina → ARG, femenino → F).",
  data360_get_timeseries:
    "Bajamos la serie completa año por año desde la API estable del Banco Mundial.",
  data360_list_indicators:
    "Pedimos el listado completo de indicadores de una base de datos.",
};

export function runningLabel(toolName: string): string {
  return RUNNING_LABELS[toolName] ?? "Procesando…";
}

export function doneLabel(toolName: string): string {
  return DONE_LABELS[toolName] ?? "Procesado";
}

export function helperLabel(toolName: string): string | null {
  return HELPER_LABELS[toolName] ?? null;
}
