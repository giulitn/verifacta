"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import Answer from "./components/Answer";
import ClaimCard from "./components/ClaimCard";
import Header from "./components/Header";
import HowItWorks from "./components/HowItWorks";
import IndicatorExplainer from "./components/IndicatorExplainer";
import SearchInput from "./components/SearchInput";
import ThemesSection from "./components/ThemesSection";
import VerificationProgress from "./components/VerificationProgress";
import { streamAgentEvents } from "./lib/sse";
import type { AgentEvent, ClaimCardData } from "./lib/types";

const DOC_LINKS = [
  { href: "/architecture", label: "Architecture" },
  { href: "/methodology", label: "Methodology" },
  { href: "/security", label: "Security" },
  { href: "/user-guide", label: "User guide" },
  { href: "/sustainability", label: "Sustainability" },
];

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
    <main className="min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-[400px] hero-glow pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-10">
        <Header onPickExample={setQuery} />

        <SearchInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
        />

        {!hasResults && !isStreaming && (
          <>
            <IndicatorExplainer />
            <ThemesSection />
            <HowItWorks />
          </>
        )}

        {hasResults && (
          <div className="space-y-5">
            <VerificationProgress events={events} isStreaming={isStreaming} />

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300"
              >
                <strong className="font-semibold text-red-200">Error:</strong>{" "}
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

        <footer className="pt-8 mt-6 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-slate-500">
            <span>Verifacta · DATA 360 Global Challenge 2026</span>
            <nav
              aria-label="Documentation"
              className="flex flex-wrap gap-x-4 gap-y-1"
            >
              {DOC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
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
