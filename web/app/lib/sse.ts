import type { AgentEvent } from "./types";

/**
 * POST to the agent and yield events as they stream in.
 *
 * The backend emits Server-Sent Events; each event is two lines (`event:`,
 * `data:`) terminated by a blank line. EventSource doesn't support POST,
 * so we drive the parser ourselves on top of fetch + ReadableStream.
 */
export async function* streamAgentEvents(
  apiUrl: string,
  query: string,
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent, void, unknown> {
  const response = await fetch(`${apiUrl}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok || !response.body) {
    // Rate limit responses carry a human-readable explanation in `detail`.
    if (response.status === 429) {
      const body = (await response.json().catch(() => ({}))) as { detail?: string };
      throw new Error(
        body.detail ||
          "Rate limit reached. Give it a minute and try again.",
      );
    }
    throw new Error(`Agent endpoint returned HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const event = parseSseEvent(rawEvent);
      if (event) yield event;
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function parseSseEvent(raw: string): AgentEvent | null {
  let type = "";
  let dataLine = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event: ")) {
      type = line.slice("event: ".length).trim();
    } else if (line.startsWith("data: ")) {
      dataLine += line.slice("data: ".length);
    }
  }
  if (!type) return null;
  try {
    const data = dataLine ? JSON.parse(dataLine) : {};
    return { type, data } as AgentEvent;
  } catch {
    return null;
  }
}
