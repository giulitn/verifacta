"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./Answer";

export type ChatMessage = {
  role: "user" | "agent";
  content: string;
};

type Props = {
  /** Ordered turns shown inside the window. */
  messages: ChatMessage[];
  /**
   * Card rendered inside the last agent bubble. Use a slot rather than a
   * typed object so demos can pass a static preview and the real result can
   * pass the full ClaimCard with copy/download actions.
   */
  claimCardSlot?: ReactNode;
  /** Shows the "Demo" pill in the header. */
  isDemo?: boolean;
  /**
   * While true the header swaps to a loading line ("Consultando…") and a
   * typing bubble is rendered after the last user turn.
   */
  isLoading?: boolean;
  /** Header title when not loading. */
  title?: string;
  /** Header line shown while loading. */
  loadingText?: string;
};

export default function ChatWindow({
  messages,
  claimCardSlot,
  isDemo = false,
  isLoading = false,
  title = "Consulta",
  loadingText = "Consultando datos oficiales…",
}: Props) {
  const lastMessage = messages[messages.length - 1];
  const showTypingBubble =
    isLoading && (!lastMessage || lastMessage.role === "user");

  return (
    <div className="max-w-[680px] mx-auto bg-[#0f1822] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex gap-1.5 shrink-0" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          {isLoading ? (
            <span className="flex items-center gap-2 ml-1 min-w-0">
              <Loader2
                className="h-3 w-3 text-emerald-400 animate-spin shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs text-slate-300 truncate">{loadingText}</p>
            </span>
          ) : (
            <p className="text-xs text-slate-400 ml-1 truncate">{title}</p>
          )}
        </div>
        {isDemo && (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 bg-white/[0.05] border border-white/[0.12] rounded-full shrink-0">
            Demo
          </span>
        )}
      </header>

      <div className="px-5 py-6 sm:px-6 sm:py-7 space-y-6">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          if (msg.role === "user") {
            return <UserBubble key={i} text={msg.content} />;
          }
          return (
            <AgentBubble key={i}>
              <div className="text-sm sm:text-base text-slate-100 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {isLast && claimCardSlot && (
                <div
                  className="animate-[fade-in_300ms_ease-out_400ms_both]"
                  style={{ opacity: 0, animationFillMode: "forwards" }}
                >
                  {claimCardSlot}
                </div>
              )}
            </AgentBubble>
          );
        })}
        {showTypingBubble && (
          <AgentBubble>
            <TypingDots aria-label="Verifacta está escribiendo" />
          </AgentBubble>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-[user-slide-in_200ms_ease-out_both]">
      <div className="max-w-[80%] space-y-1">
        <p className="text-[11px] font-medium text-slate-500 text-right">
          Periodista
        </p>
        <div className="bg-[#1b2838] border border-white/[0.08] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 animate-[agent-slide-in_300ms_ease-out_both]">
      <BrandAvatar />
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-[11px] font-medium text-slate-500">Verifacta</p>
        <div className="bg-[#131f2c] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3 space-y-3">
          {children}
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
