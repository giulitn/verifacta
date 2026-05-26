"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatWindow, { type ChatMessage } from "./ChatWindow";
import ClaimCard from "./ClaimCard";
import type { ClaimCardData } from "../lib/types";

const DEMO_QUESTION = "¿Cuál fue el PBI per cápita de Argentina en 2022?";

const DEMO_CLAIM: ClaimCardData = {
  answer:
    "El PBI per cápita de Argentina en 2022 fue de USD 13.738, según datos oficiales del Banco Mundial.",
  indicators: [{ database: "WB_WDI", indicator: "NY.GDP.PCAP.CD" }],
  timestamp: "2026-05-25T14:30:00Z",
  sha256: "bb79d70b5ed89770a2d31321ec622d538e649aaaecabc5f12f2b2a0551e6296f",
};

type Phase = "idle" | "user" | "typing" | "done";

export default function ExampleChat() {
  const [phase, setPhase] = useState<Phase>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Honor reduced-motion: skip the animation entirely and show the
    // finished state immediately.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      triggeredRef.current = true;
      setPhase("done");
      return;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggeredRef.current) return;
        triggeredRef.current = true;
        setPhase("user");
        timers.push(window.setTimeout(() => setPhase("typing"), 300));
        timers.push(window.setTimeout(() => setPhase("done"), 1800));
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const messages = useMemo<ChatMessage[]>(() => {
    if (phase === "idle") return [];
    const msgs: ChatMessage[] = [{ role: "user", content: DEMO_QUESTION }];
    if (phase === "done") {
      msgs.push({ role: "agent", content: DEMO_CLAIM.answer });
    }
    return msgs;
  }, [phase]);

  const claimCardSlot =
    phase === "done" ? <ClaimCard {...DEMO_CLAIM} embedded /> : undefined;

  return (
    <div ref={containerRef}>
      <ChatWindow
        messages={messages}
        claimCardSlot={claimCardSlot}
        isDemo
        isLoading={phase === "typing"}
        title="Ejemplo de consulta"
      />
    </div>
  );
}
