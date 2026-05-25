"use client";

import type { LucideIcon } from "lucide-react";

type Props = {
  Icon: LucideIcon;
  text: string;
  onClick: () => void;
};

/**
 * One-tap example query. Clicking populates the search input above the fold.
 * Designed for journalists who land on the page without knowing what to ask.
 */
export default function UseCaseCard({ Icon, text, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Probar ejemplo: ${text}`}
      className="group flex items-start gap-3 p-4 text-left bg-[#131f2c] border border-white/[0.08] rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
    >
      <span
        aria-hidden="true"
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/[0.12] group-hover:border-emerald-500/40 transition-colors"
      >
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </span>
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors pt-1.5">
        {text}
      </span>
    </button>
  );
}
