"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, SpinnerIcon } from "./Icons";

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

/**
 * One-line search bar with an integrated "Consultar" button.
 * Placeholder rotates every 3s when the input is empty AND not focused —
 * focusing or typing pauses the rotation so the cursor isn't fighting
 * with shifting text.
 */
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !isStreaming && value.trim()) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
          disabled={isStreaming}
          aria-label="Consulta a verificar"
          className="w-full pl-4 pr-32 py-3.5 text-base text-neutral-900 bg-white border border-neutral-300 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors disabled:bg-neutral-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isStreaming || !value.trim()}
          aria-label="Verificar afirmación"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <>
              <SpinnerIcon className="h-4 w-4" />
              Verificando
            </>
          ) : (
            <>
              Consultar
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        Conectado al{" "}
        <a
          href="https://data360.worldbank.org"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted hover:text-neutral-700"
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
