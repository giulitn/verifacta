"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Answer from "./components/Answer";
import ClaimCard from "./components/ClaimCard";
import Header from "./components/Header";
import HowItWorks from "./components/HowItWorks";
import SearchInput from "./components/SearchInput";
import VerificationProgress from "./components/VerificationProgress";
import { streamAgentEvents } from "./lib/sse";
import type { AgentEvent, ClaimCardData } from "./lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || isStreaming) return;
    if (!apiUrl) {
      setEvents([
        {
          type: "error",
          data: { message: "NEXT_PUBLIC_API_URL no está configurada." },
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
  }, [apiUrl, query, isStreaming]);

  const { claimCard, errorMessage } = useMemo(
    () => summarizeEvents(events),
    [events],
  );

  const hasResults = events.length > 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <Header onPickExample={setQuery} />

        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
        />

        {!hasResults && !isStreaming && <HowItWorks />}

        {hasResults && (
          <div className="space-y-5">
            <VerificationProgress events={events} isStreaming={isStreaming} />

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <strong className="font-semibold">Error:</strong>{" "}
                {errorMessage}
              </div>
            )}

            {claimCard && (
              <>
                <Answer text={claimCard.answer} />
                <ClaimCard {...claimCard} />
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

type EventSummary = {
  claimCard: ClaimCardData | null;
  errorMessage: string | null;
};

function summarizeEvents(events: AgentEvent[]): EventSummary {
  let claimCard: ClaimCardData | null = null;
  let errorMessage: string | null = null;
  for (const event of events) {
    if (event.type === "claim_card") claimCard = event.data;
    else if (event.type === "error") errorMessage = event.data.message;
  }
  return { claimCard, errorMessage };
}
