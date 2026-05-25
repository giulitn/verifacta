"use client";

import { ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
};

const ROTATING_PLACEHOLDERS = [
  "¿Cuál fue el PBI per cápita de Argentina en 2022?",
  "Acceso a electricidad en África subsahariana",
  "Mortalidad infantil en América Latina",
  "Emisiones de CO₂ de Chile y Uruguay",
];

const ROTATION_INTERVAL_MS = 3000;

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  isStreaming,
}: Props) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || value) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isFocused, value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter newlines (ChatGPT pattern).
    if (event.key === "Enter" && !event.shiftKey && !isStreaming && value.trim()) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-2xl border bg-[#131f2c] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all ${
          isFocused
            ? "border-emerald-500/60 ring-2 ring-emerald-500/20"
            : "border-white/10 hover:border-white/[0.16]"
        }`}
      >
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
          disabled={isStreaming}
          aria-label="Consulta a verificar"
          className="block w-full bg-transparent px-5 pt-5 pb-2 text-lg text-white placeholder:text-slate-500 resize-none focus:outline-none disabled:cursor-not-allowed leading-snug"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-2">
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] text-[10px] font-mono text-slate-400">
              <CornerDownLeft className="h-2.5 w-2.5" />
              Enter
            </kbd>
            para consultar
          </p>
          <span className="sm:hidden" />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isStreaming || !value.trim()}
            aria-label="Verificar afirmación"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-[#0a0f1a] bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando
              </>
            ) : (
              <>
                Consultar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Conectado al{" "}
        <a
          href="https://data360.worldbank.org"
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 underline decoration-dotted hover:text-slate-200"
        >
          catálogo Data360 del Banco Mundial
        </a>
        {" "}— más de 1.600 indicadores oficiales. Cada respuesta se firma
        criptográficamente para que cualquiera pueda verificar que no fue
        alterada.
      </p>
    </div>
  );
}
