"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CopyButton from "./CopyButton";

const SAMPLE = {
  question: "¿Cuál fue el PBI per cápita de Argentina en 2022?",
  answer:
    "El PBI per cápita de Argentina en 2022 fue de USD 13.738, según datos oficiales del Banco Mundial.",
  source: "Banco Mundial — NY.GDP.PCAP.CD",
  date: "25 de mayo de 2026, 14:30 UTC",
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
        timers.push(window.setTimeout(() => setPhase("typing"), 800));
        timers.push(window.setTimeout(() => setPhase("done"), 2300));
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const userVisible = phase !== "idle";
  const agentVisible = phase === "typing" || phase === "done";

  return (
    <div
      ref={containerRef}
      className="max-w-[680px] mx-auto bg-[#0f1822] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          <p className="text-xs text-slate-400 ml-1">Ejemplo de consulta</p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 bg-white/[0.05] border border-white/[0.12] rounded-full">
          Demo
        </span>
      </header>

      <div className="px-5 py-6 sm:px-6 sm:py-7 space-y-6">
        <div
          className={`flex justify-end transition-all duration-500 ease-out ${
            userVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-3"
          }`}
        >
          <div className="max-w-[80%] space-y-1">
            <p className="text-[11px] font-medium text-slate-500 text-right">
              Periodista
            </p>
            <div className="bg-[#1b2838] border border-white/[0.08] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-slate-100 leading-relaxed">
              {SAMPLE.question}
            </div>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 transition-all duration-500 ease-out ${
            agentVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-3"
          }`}
        >
          <BrandAvatar />
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-[11px] font-medium text-slate-500">Verifacta</p>
            <div className="bg-[#131f2c] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3 space-y-3">
              {phase === "done" ? (
                <AgentResponse />
              ) : (
                <TypingDots aria-label="Verifacta está escribiendo" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentResponse() {
  return (
    <div className="space-y-3 animate-[fade-in_300ms_ease-out]">
      <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
        {SAMPLE.answer}
      </p>
      <InlineClaimCard />
    </div>
  );
}

function InlineClaimCard() {
  return (
    <div className="bg-black/[0.25] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/[0.12] border border-emerald-500/30 rounded-full">
          <Check className="h-3 w-3" strokeWidth={2.5} />
          Verificado
        </span>
        <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
          Claim Card
        </span>
      </div>

      <dl className="space-y-1.5 text-xs">
        <div className="flex gap-2">
          <dt className="text-slate-500 shrink-0 w-14">Fuente</dt>
          <dd className="text-slate-300">
            Banco Mundial{" "}
            <span className="text-slate-500">·</span>{" "}
            <span className="font-mono text-slate-400">NY.GDP.PCAP.CD</span>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500 shrink-0 w-14">Fecha</dt>
          <dd className="text-slate-300">{SAMPLE.date}</dd>
        </div>
      </dl>

      <div className="flex items-start gap-2 pt-1">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Firma SHA-256
          </p>
          <p
            className="font-mono text-[11px] text-emerald-300 bg-emerald-500/[0.06] rounded-md px-2 py-1 break-all"
            aria-label={`Firma SHA-256: ${SAMPLE.sha256}`}
          >
            {SAMPLE.sha256}
          </p>
        </div>
        <div className="pt-4 shrink-0">
          <CopyButton
            value={SAMPLE.sha256}
            ariaLabel="Copiar firma SHA-256 de ejemplo"
          />
        </div>
      </div>
    </div>
  );
}

function TypingDots({ "aria-label": ariaLabel }: { "aria-label": string }) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 py-1"
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-slate-500 typing-dot"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-slate-500 typing-dot"
        style={{ animationDelay: "180ms" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-slate-500 typing-dot"
        style={{ animationDelay: "360ms" }}
      />
    </span>
  );
}

function BrandAvatar() {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#131f2c] border border-white/[0.08]"
    >
      <svg viewBox="-22 -22 44 44" className="w-5 h-5">
        <rect
          x="-14"
          y="-14"
          width="28"
          height="28"
          rx="3"
          fill="none"
          stroke="#f9fafb"
          strokeWidth="2"
          transform="rotate(45)"
        />
        <polyline
          points="-6,1 -1,6 7,-5"
          fill="none"
          stroke="#f9fafb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="-11" r="3" fill="#22c55e" />
      </svg>
    </span>
  );
}
