"use client";

import type { ClaimCardData } from "../lib/types";
import CopyButton from "./CopyButton";
import { DownloadIcon } from "./Icons";
import Tooltip from "./Tooltip";

const DATABASE_LABELS: Record<string, string> = {
  WB_WDI: "Banco Mundial — World Development Indicators (WDI)",
  WB_SSGD: "Banco Mundial — Statistics on Sustainable Growth and Development",
  WB_HCP: "Banco Mundial — Human Capital Project",
  "WB Indicators v2 (WDI)": "Banco Mundial — Indicators v2 (WDI)",
};

function humanDatabase(code: string): string {
  return DATABASE_LABELS[code] ?? `Banco Mundial — ${code}`;
}

function humanTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const dateStr = new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    const timeStr = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date);
    return `${dateStr}, ${timeStr} UTC`;
  } catch {
    return iso;
  }
}

function downloadJson(data: ClaimCardData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `verifacta-claim-${data.sha256.slice(0, 8)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ClaimCard(data: ClaimCardData) {
  const verified = data.indicators.length > 0;
  if (!verified) return <RejectionCard {...data} />;

  return (
    <article
      aria-label="Tarjeta de verificación (Claim Card)"
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="p-6 sm:p-7 space-y-5">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-neutral-500">
              Claim Card
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-emerald-600 rounded-full">
              ✓ Verificado
            </span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Este dato fue obtenido directamente del Banco Mundial Data360 y
            firmado criptográficamente. Cualquier modificación al texto o a
            la fuente invalida la firma de abajo.
          </p>
        </header>

        <div className="space-y-3">
          <Field label={`Fuente${data.indicators.length > 1 ? "s" : ""} consultada${data.indicators.length > 1 ? "s" : ""}`}>
            <ul className="space-y-1.5">
              {data.indicators.map((indicator, i) => (
                <li
                  key={`${indicator.database}-${indicator.indicator}-${i}`}
                  className="text-sm text-neutral-800"
                >
                  <span className="font-medium">{humanDatabase(indicator.database)}</span>
                  <span className="text-neutral-400 mx-2">·</span>
                  <span className="font-mono text-xs text-neutral-600">
                    {indicator.indicator}
                  </span>
                </li>
              ))}
            </ul>
          </Field>

          <Field label="Fecha de verificación">
            <p className="text-sm text-neutral-800">
              {humanTimestamp(data.timestamp)}
            </p>
          </Field>
        </div>
      </div>

      <footer className="border-t border-neutral-100 bg-neutral-50/50 px-6 sm:px-7 py-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Para citar o verificar
          </h4>
          <button
            type="button"
            onClick={() => downloadJson(data)}
            aria-label="Descargar Claim Card en formato JSON"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Descargar JSON
          </button>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Firma SHA-256
              </span>
              <Tooltip content="Esta firma única garantiza que el dato no fue alterado. Cualquier cambio en la respuesta, las fuentes o el timestamp produciría una firma distinta.">
                <span
                  aria-hidden="true"
                  className="text-[11px] text-neutral-400 hover:text-neutral-600"
                >
                  ⓘ
                </span>
              </Tooltip>
            </div>
            <p
              className="font-mono text-xs text-emerald-700 bg-emerald-50 rounded-md px-2.5 py-1.5 break-all"
              aria-label={`Firma SHA-256: ${data.sha256}`}
            >
              {data.sha256}
            </p>
          </div>
          <div className="pt-5">
            <CopyButton value={data.sha256} ariaLabel="Copiar firma SHA-256" />
          </div>
        </div>
      </footer>
    </article>
  );
}

function RejectionCard(data: ClaimCardData) {
  return (
    <article
      aria-label="Verificación rechazada"
      className="bg-white border-2 border-red-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-[0_1px_3px_rgba(220,38,38,0.08),_0_4px_16px_rgba(220,38,38,0.06)]"
    >
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-neutral-500">
            Claim Card
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-red-600 rounded-full">
            ⚠ Sin datos verificables
          </span>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed bg-red-50 border-l-[3px] border-red-400 px-3 py-2.5 rounded-r">
          No encontramos esta información en el catálogo Data360 del Banco
          Mundial. Verifacta no inventa datos: cuando una pregunta cae fuera
          de las estadísticas oficiales, decimos &ldquo;no sé&rdquo; en lugar
          de improvisar.
        </p>
      </header>

      <Field label="Respuesta del agente">
        <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
          {data.answer}
        </p>
      </Field>

      <div className="pt-3 border-t border-neutral-100">
        <Field label="Fecha de respuesta">
          <p className="text-sm text-neutral-800">
            {humanTimestamp(data.timestamp)}
          </p>
        </Field>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
