"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

type Props = {
  /** Text to write to the clipboard. */
  value: string;
  /** Screen-reader label, e.g. "Copiar firma SHA-256". */
  ariaLabel: string;
};

export default function CopyButton({ value, ariaLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in non-secure contexts; the button still
      // signals failure silently — users will retry.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
          Copiado
        </>
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5" />
          Copiar
        </>
      )}
    </button>
  );
}
