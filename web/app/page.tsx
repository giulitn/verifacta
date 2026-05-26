"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import ChatWindow, { type ChatMessage } from "./components/ChatWindow";
import ClaimCard from "./components/ClaimCard";
import ExampleChat from "./components/ExampleChat";
import ExampleQueries from "./components/ExampleQueries";
import Header from "./components/Header";
import HowItWorks from "./components/HowItWorks";
import KnowledgeBase from "./components/KnowledgeBase";
import SearchInput from "./components/SearchInput";
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
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || isStreaming) return;
    if (!apiUrl) {
      setSubmittedQuery(trimmed);
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

    setSubmittedQuery(trimmed);
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

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setEvents([]);
    setSubmittedQuery("");
    setQuery("");
  }, []);

  const { claimCard, finalAnswer, errorMessage } = useMemo(
    () => summarizeEvents(events),
    [events],
  );

  const hasResults = events.length > 0 || isStreaming;
  const agentText = finalAnswer ?? claimCard?.answer ?? "";
  const messages = useMemo<ChatMessage[]>(() => {
    if (!submittedQuery) return [];
    const msgs: ChatMessage[] = [{ role: "user", content: submittedQuery }];
    if (agentText) msgs.push({ role: "agent", content: agentText });
    return msgs;
  }, [submittedQuery, agentText]);

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-[400px] hero-glow pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        <Header />

        {!hasResults && (
          <>
            <HowItWorks />
            <section
              aria-label="Ejemplo de respuesta verificada"
              className="space-y-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
                  Así se ve una respuesta verificada
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Cada consulta genera esto — un dato oficial con su fuente y
                  su sello.
                </p>
              </div>
              <ExampleChat />
            </section>
            <ExampleQueries onPick={setQuery} />
          </>
        )}

        {!hasResults && (
          <SearchInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
          />
        )}

        {hasResults && (
          <div className="space-y-4">
            <ChatWindow
              messages={messages}
              claimCardSlot={
                claimCard ? <ClaimCard {...claimCard} embedded /> : undefined
              }
              isLoading={isStreaming}
              title={claimCard ? "Consulta verificada" : "Consulta"}
            />

            {errorMessage && (
              <div
                role="alert"
                className="max-w-[680px] mx-auto rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300"
              >
                <strong className="font-semibold text-red-200">Error:</strong>{" "}
                {errorMessage}
              </div>
            )}

            <div className="max-w-[680px] mx-auto space-y-3">
              <VerificationProgress
                events={events}
                isStreaming={isStreaming}
              />
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded px-1 py-0.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Nueva consulta
                </button>
              </div>
            </div>
          </div>
        )}

        <KnowledgeBase />

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
  finalAnswer: string | null;
  errorMessage: string | null;
};

function summarizeEvents(events: AgentEvent[]): EventSummary {
  let claimCard: ClaimCardData | null = null;
  let finalAnswer: string | null = null;
  let errorMessage: string | null = null;
  for (const event of events) {
    if (event.type === "claim_card") claimCard = event.data;
    else if (event.type === "final_answer") finalAnswer = event.data.text;
    else if (event.type === "error") errorMessage = event.data.message;
  }
  return { claimCard, finalAnswer, errorMessage };
}
