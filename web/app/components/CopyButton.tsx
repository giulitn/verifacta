"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string;
  ariaLabel: string;
  label?: string;
};

export default function CopyButton({ value, ariaLabel, label = "Copiar" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in non-secure contexts; silent failure.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
