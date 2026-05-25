"use client";

import { useId, useState, type ReactNode } from "react";

type Props = {
  /** Element that triggers the tooltip on hover or keyboard focus. */
  children: ReactNode;
  /** Tooltip body text. */
  content: string;
};

/**
 * Minimal Tailwind tooltip. Visible on hover (desktop) and keyboard
 * focus (accessibility). Touch users get it via focus when the
 * triggering element is interactive — for non-interactive triggers we
 * wrap in a button below so screen readers and keyboard users still
 * reach it.
 */
export default function Tooltip({ children, content }: Props) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-normal leading-snug text-white bg-neutral-900 rounded-lg shadow-lg w-64 z-50 transition-opacity pointer-events-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
