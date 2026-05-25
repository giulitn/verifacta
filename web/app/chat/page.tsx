"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ClaimCard from "../components/ClaimCard";
import ToolCall from "../components/ToolCall";
import { streamAgentEvents } from "../lib/sse";
import type { AgentEvent } from "../lib/types";

const EXAMPLE_QUERIES = [
  "What is the GDP per capita of Argentina in 2022?",
  "How has female labor participation in Brazil changed in the last decade?",
  "Compare CO2 emissions per capita between Chile and Uruguay in 2020.",
];

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || isStreaming) return;
      if (!apiUrl) {
        setEvents([
          {
            type: "error",
            data: { message: "NEXT_PUBLIC_API_URL is not configured." },
          },
        ]);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setEvents([]);
      setIsStreaming(true);
      try {
        for await (const event of streamAgentEvents(
          apiUrl,
          trimmed,
          controller.signal,
        )) {
          setEvents((prev) => [...prev, event]);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setEvents((prev) => [
            ...prev,
            { type: "error", data: { message: String(err) } },
          ]);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [apiUrl, query, isStreaming],
  );

  const { toolCalls, completedIds, claimCard, errorMessage, finalAnswer } =
    useMemo(() => summarizeEvents(events), [events]);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Verifacta</h1>
          <p className="text-sm text-neutral-600">
            Ask a fact-check question grounded in the World Bank Data360
            catalogue. Every answer is signed and cites its sources.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What was Argentina's GDP per capita in 2022?"
            disabled={isStreaming}
            rows={3}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  disabled={isStreaming}
                  className="text-xs text-neutral-600 underline decoration-dotted hover:text-neutral-900 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isStreaming || !query.trim()}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isStreaming ? "Verifying…" : "Verify"}
            </button>
          </div>
        </form>

        {toolCalls.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Agent steps
            </h2>
            <div className="space-y-2">
              {toolCalls.map((tc) => (
                <ToolCall
                  key={tc.data.id}
                  name={tc.data.name}
                  args={tc.data.args}
                  done={completedIds.has(tc.data.id)}
                />
              ))}
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <strong className="font-semibold">Error:</strong> {errorMessage}
          </div>
        )}

        {finalAnswer && !claimCard && (
          <div className="text-sm text-neutral-700 italic">
            Finalizing Claim Card…
          </div>
        )}

        {claimCard && <ClaimCard {...claimCard} />}
      </div>
    </main>
  );
}

type EventSummary = {
  toolCalls: Extract<AgentEvent, { type: "tool_call_start" }>[];
  completedIds: Set<string>;
  claimCard: Extract<AgentEvent, { type: "claim_card" }>["data"] | null;
  errorMessage: string | null;
  finalAnswer: string | null;
};

function summarizeEvents(events: AgentEvent[]): EventSummary {
  const toolCalls: EventSummary["toolCalls"] = [];
  const completedIds = new Set<string>();
  let claimCard: EventSummary["claimCard"] = null;
  let errorMessage: EventSummary["errorMessage"] = null;
  let finalAnswer: EventSummary["finalAnswer"] = null;

  for (const event of events) {
    if (event.type === "tool_call_start") toolCalls.push(event);
    else if (event.type === "tool_call_end") completedIds.add(event.data.id);
    else if (event.type === "final_answer") finalAnswer = event.data.text;
    else if (event.type === "claim_card") claimCard = event.data;
    else if (event.type === "error") errorMessage = event.data.message;
  }

  return { toolCalls, completedIds, claimCard, errorMessage, finalAnswer };
}
