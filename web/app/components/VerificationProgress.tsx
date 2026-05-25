"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AgentEvent } from "../lib/types";
import { doneLabel, runningLabel } from "../lib/tool-labels";

type ToolCallStartEvent = Extract<AgentEvent, { type: "tool_call_start" }>;

type Props = {
  events: AgentEvent[];
  isStreaming: boolean;
};

const STEP_REVEAL_DELAY_MS = 600;

export default function VerificationProgress({ events, isStreaming }: Props) {
  const startEvents = events.filter(
    (e): e is ToolCallStartEvent => e.type === "tool_call_start",
  );
  const completedIds = new Set(
    events.filter((e) => e.type === "tool_call_end").map((e) => e.data.id),
  );

  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    const visibleSet = new Set(visibleIds);
    const queuedSet = new Set(queueRef.current);
    for (const event of startEvents) {
      const id = event.data.id;
      if (!visibleSet.has(id) && !queuedSet.has(id)) {
        queueRef.current.push(id);
      }
    }
    processQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startEvents.length]);

  function processQueue() {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;
    const nextId = queueRef.current.shift()!;
    setVisibleIds((current) => [...current, nextId]);
    window.setTimeout(() => {
      processingRef.current = false;
      processQueue();
    }, STEP_REVEAL_DELAY_MS);
  }

  const allRevealed =
    visibleIds.length === startEvents.length && startEvents.length > 0;
  const streamDone = !isStreaming && allRevealed;
  const [forceOpen, setForceOpen] = useState(true);
  useEffect(() => {
    if (streamDone) setForceOpen(false);
  }, [streamDone]);

  if (startEvents.length === 0 && !isStreaming) return null;

  const visibleEvents = startEvents.filter((e) =>
    visibleIds.includes(e.data.id),
  );

  return (
    <section
      aria-label="Pasos de verificación"
      className="bg-[#131f2c] border border-white/[0.08] rounded-xl overflow-hidden"
    >
      <details open={forceOpen || isStreaming} className="group">
        <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-2.5">
            {isStreaming ? (
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
            ) : (
              <Check className="h-4 w-4 text-emerald-400" />
            )}
            <span className="text-sm font-medium text-white">
              {isStreaming
                ? "Verificando contra datos oficiales…"
                : `Verificado en ${startEvents.length} ${
                    startEvents.length === 1 ? "paso" : "pasos"
                  }`}
            </span>
          </div>
          <span className="text-xs text-slate-500 group-open:hidden">
            Ver detalle
          </span>
          <span className="text-xs text-slate-500 hidden group-open:inline">
            Ocultar
          </span>
        </summary>

        {isStreaming && (
          <div className="h-0.5 bg-emerald-500/10 overflow-hidden mx-4">
            <div className="h-full w-1/3 bg-gradient-to-r from-emerald-400 to-emerald-500 animate-[progress-slide_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        <ol className="px-4 pb-4 pt-2 space-y-2">
          {visibleEvents.map((event) => {
            const isDone = completedIds.has(event.data.id);
            return (
              <li
                key={event.data.id}
                className="animate-[fade-in-up_300ms_ease-out_both] flex items-start gap-3"
              >
                <span className="mt-0.5 shrink-0">
                  {isDone ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">
                    {isDone
                      ? doneLabel(event.data.name)
                      : runningLabel(event.data.name)}
                  </p>
                  <details className="mt-1">
                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 select-none transition-colors">
                      Ver detalle técnico
                    </summary>
                    <pre className="mt-1.5 px-2.5 py-2 text-[11px] leading-snug text-slate-400 bg-black/30 border border-white/[0.04] rounded-md overflow-x-auto font-mono">
                      {event.data.name}({"\n"}
                      {Object.entries(event.data.args)
                        .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
                        .join(",\n")}
                      {"\n"})
                    </pre>
                  </details>
                </div>
              </li>
            );
          })}
        </ol>
      </details>
    </section>
  );
}
