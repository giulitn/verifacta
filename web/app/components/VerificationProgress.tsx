"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentEvent } from "../lib/types";
import { doneLabel, runningLabel } from "../lib/tool-labels";
import { CheckIcon, SpinnerIcon } from "./Icons";

type ToolCallStartEvent = Extract<AgentEvent, { type: "tool_call_start" }>;

type Props = {
  events: AgentEvent[];
  isStreaming: boolean;
};

const STEP_REVEAL_DELAY_MS = 600;

/**
 * Sequential reveal of the agent's tool calls.
 *
 * Even when the backend emits two events in the same tick (parallel
 * tool calls), the UI paces them at STEP_REVEAL_DELAY_MS between visible
 * entries so the reasoning reads as a deliberate sequence rather than a
 * flash.
 *
 * Once streaming finishes, the whole section auto-collapses into a
 * single-line summary that the user can re-expand if they want to
 * audit the steps.
 */
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

  // Once everything is revealed AND the stream ended, default the panel
  // to collapsed. The user can re-open it.
  const allRevealed =
    visibleIds.length === startEvents.length && startEvents.length > 0;
  const streamDone = !isStreaming && allRevealed;
  const [forceOpen, setForceOpen] = useState(true);
  useEffect(() => {
    if (streamDone) setForceOpen(false);
  }, [streamDone]);

  if (startEvents.length === 0 && !isStreaming) return null;

  const visibleEvents = startEvents.filter((e) => visibleIds.includes(e.data.id));

  return (
    <section
      aria-label="Pasos de verificación"
      className="bg-white border border-neutral-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <details open={forceOpen || isStreaming} className="group">
        <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <SpinnerIcon className="h-4 w-4 text-emerald-600" />
            ) : (
              <CheckIcon className="h-4 w-4 text-emerald-600" />
            )}
            <span className="text-sm font-medium text-neutral-800">
              {isStreaming
                ? "Verificando contra datos oficiales…"
                : `Verificado en ${startEvents.length} ${
                    startEvents.length === 1 ? "paso" : "pasos"
                  }`}
            </span>
          </div>
          <span className="text-xs text-neutral-500 group-open:hidden">
            Ver detalle
          </span>
          <span className="text-xs text-neutral-500 hidden group-open:inline">
            Ocultar
          </span>
        </summary>

        {isStreaming && (
          <div className="h-1 bg-emerald-50 overflow-hidden mx-4">
            <div className="h-full w-1/3 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-[progress-slide_1.5s_ease-in-out_infinite]" />
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
                    <CheckIcon className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <SpinnerIcon className="h-4 w-4 text-amber-500" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800">
                    {isDone
                      ? doneLabel(event.data.name)
                      : runningLabel(event.data.name)}
                  </p>
                  <details className="mt-1">
                    <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700 select-none">
                      Ver detalle técnico
                    </summary>
                    <pre className="mt-1.5 px-2.5 py-2 text-[11px] leading-snug text-neutral-600 bg-neutral-50 rounded-md overflow-x-auto font-mono">
                      {event.data.name}({"\n"}
                      {Object.entries(event.data.args)
                        .map(
                          ([k, v]) =>
                            `  ${k}: ${JSON.stringify(v)}`,
                        )
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
