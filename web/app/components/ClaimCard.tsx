"use client";

import { AlertTriangle, Check, Download, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ClaimCardData } from "../lib/types";
import { markdownComponents } from "./Answer";
import CopyButton from "./CopyButton";
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

function permalink(sha256: string): string {
  // Use the configured site URL in prod (Vercel/Railway); fall back to the
  // current origin so the link is correct in local dev with no env setup.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const base =
    configured ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/c/${sha256}`;
}

function buildCitation(data: ClaimCardData): string {
  const cleanAnswer = data.answer.trim();
  const dateStr = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.timestamp));
  const isSingle = data.indicators.length === 1;
  const header = isSingle ? "Fuente oficial:" : "Fuentes oficiales:";
  const sourceLines = data.indicators.map(
    (i) => `https://data360.worldbank.org/en/indicator/${i.indicator}`,
  );
  return [
    cleanAnswer,
    "",
    header,
    ...sourceLines,
    "",
    `Claim Card: ${permalink(data.sha256)}`,
    `Verificado el ${dateStr} con verifacta.app`,
  ].join("\n");
}

type Props = ClaimCardData & {
  /**
   * Compact variant designed to live inside a chat bubble: no outer
   * chrome, tighter typography, actions inline. The full variant
   * (the default) is used standalone.
   */
  embedded?: boolean;
};

export default function ClaimCard({ embedded = false, ...data }: Props) {
  const verified = data.indicators.length > 0;
  if (!verified) {
    return embedded ? (
      <EmbeddedRejectionCard {...data} />
    ) : (
      <RejectionCard {...data} />
    );
  }
  if (embedded) return <EmbeddedClaimCard {...data} />;
  return <FullClaimCard {...data} />;
}

function FullClaimCard(data: ClaimCardData) {
  return (
    <article
      aria-label="Tarjeta de verificación"
      className="bg-[#131f2c] border border-white/[0.08] rounded-xl overflow-hidden"
    >
      <div className="p-6 sm:p-7 space-y-5">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-500">
              Claim Card
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/[0.12] border border-emerald-500/30 rounded-full">
              <Check className="h-3 w-3" strokeWidth={2.5} />
              Verificado
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Este dato fue obtenido directamente del Banco Mundial Data360 y
            firmado criptográficamente. Cualquier modificación al texto o a
            la fuente invalida la firma de abajo.
          </p>
        </header>

        <div className="space-y-3">
          <Field
            label={`Fuente${data.indicators.length > 1 ? "s" : ""} consultada${
              data.indicators.length > 1 ? "s" : ""
            }`}
          >
            <ul className="space-y-1.5">
              {data.indicators.map((indicator, i) => (
                <li
                  key={`${indicator.database}-${indicator.indicator}-${i}`}
                  className="text-sm text-slate-200"
                >
                  <span className="text-slate-300">
                    {humanDatabase(indicator.database)}
                  </span>
                  <span className="text-slate-600 mx-2">·</span>
                  <span className="font-mono text-xs text-slate-400">
                    {indicator.indicator}
                  </span>
                </li>
              ))}
            </ul>
          </Field>

          <Field label="Fecha de verificación">
            <p className="text-sm text-slate-200">
              {humanTimestamp(data.timestamp)}
            </p>
          </Field>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] bg-black/[0.2] px-6 sm:px-7 py-4 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Compartir y verificar
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <CopyButton
              value={permalink(data.sha256)}
              ariaLabel="Copiar link público de la Claim Card"
              label="Copiar link"
            />
            <CopyButton
              value={buildCitation(data)}
              ariaLabel="Copiar respuesta como cita lista para pegar"
              label="Copiar como cita"
            />
            <button
              type="button"
              onClick={() => downloadJson(data)}
              aria-label="Descargar Claim Card en formato JSON"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Link público
            </span>
            <Tooltip content="Compartí este link en lugar del hash crudo. Quien lo abra ve esta misma Claim Card y puede ir directo a la fuente oficial en Data360.">
              <Info
                className="h-3 w-3 text-slate-500 hover:text-slate-300 transition-colors"
                aria-hidden="true"
              />
            </Tooltip>
          </div>
          <p
            className="font-mono text-xs text-slate-200 bg-white/[0.04] rounded-md px-2.5 py-1.5 break-all"
            aria-label={`Link público: ${permalink(data.sha256)}`}
          >
            {permalink(data.sha256)}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Firma SHA-256
              </span>
              <Tooltip content="Aval de integridad del link de arriba: si alguien modificara esta Claim Card, la firma dejaría de coincidir. Es para auditores; los lectores usan el link.">
                <Info
                  className="h-3 w-3 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-hidden="true"
                />
              </Tooltip>
            </div>
            <p
              className="font-mono text-xs text-emerald-300 bg-emerald-500/[0.06] rounded-md px-2.5 py-1.5 break-all"
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

function EmbeddedClaimCard(data: ClaimCardData) {
  return (
    <div className="bg-black/[0.25] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/[0.12] border border-emerald-500/30 rounded-full">
          <Check className="h-3 w-3" strokeWidth={2.5} />
          Verificado
        </span>
        <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
          Claim Card
        </span>
      </div>

      <dl className="space-y-1.5 text-xs">
        {data.indicators.map((indicator, i) => (
          <div
            key={`${indicator.database}-${indicator.indicator}-${i}`}
            className="flex gap-2"
          >
            <dt className="text-slate-500 shrink-0 w-14">
              {i === 0 ? "Fuente" : ""}
            </dt>
            <dd className="text-slate-300 min-w-0">
              <span className="text-slate-300">
                {humanDatabase(indicator.database)}
              </span>{" "}
              <span className="text-slate-500">·</span>{" "}
              <span className="font-mono text-slate-400 break-all">
                {indicator.indicator}
              </span>
            </dd>
          </div>
        ))}
        <div className="flex gap-2">
          <dt className="text-slate-500 shrink-0 w-14">Fecha</dt>
          <dd className="text-slate-300">{humanTimestamp(data.timestamp)}</dd>
        </div>
      </dl>

      <div className="flex items-start gap-2 pt-1">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Firma SHA-256
          </p>
          <p
            className="font-mono text-[11px] text-emerald-300 bg-emerald-500/[0.06] rounded-md px-2 py-1 break-all"
            aria-label={`Firma SHA-256: ${data.sha256}`}
          >
            {data.sha256}
          </p>
        </div>
        <div className="pt-4 shrink-0">
          <CopyButton value={data.sha256} ariaLabel="Copiar firma SHA-256" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
        <CopyButton
          value={buildCitation(data)}
          ariaLabel="Copiar respuesta como cita lista para pegar"
          label="Copiar como cita"
        />
        <button
          type="button"
          onClick={() => downloadJson(data)}
          aria-label="Descargar Claim Card en formato JSON"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
        >
          <Download className="h-3.5 w-3.5" />
          JSON
        </button>
      </div>
    </div>
  );
}

function RejectionCard(data: ClaimCardData) {
  return (
    <article
      aria-label="Verificación rechazada"
      className="bg-[#131f2c] border border-red-500/30 rounded-xl p-6 sm:p-7 space-y-4"
    >
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-500">
            Claim Card
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-300 bg-red-500/[0.12] border border-red-500/30 rounded-full">
            <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            Sin datos verificables
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed bg-red-500/[0.06] border-l-[3px] border-red-500/60 px-3 py-2.5 rounded-r">
          No encontramos esta información en el catálogo Data360 del Banco
          Mundial. Verifacta no inventa datos: cuando una pregunta cae fuera
          de las estadísticas oficiales, decimos &ldquo;no sé&rdquo; en lugar
          de improvisar.
        </p>
      </header>

      <Field label="Respuesta del agente">
        <div className="text-sm text-slate-200 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {data.answer}
          </ReactMarkdown>
        </div>
      </Field>

      <div className="pt-3 border-t border-white/[0.06]">
        <Field label="Fecha de respuesta">
          <p className="text-sm text-slate-200">
            {humanTimestamp(data.timestamp)}
          </p>
        </Field>
      </div>
    </article>
  );
}

function EmbeddedRejectionCard(data: ClaimCardData) {
  return (
    <div className="bg-red-500/[0.05] border border-red-500/25 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300 bg-red-500/[0.12] border border-red-500/30 rounded-full">
          <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
          Sin datos verificables
        </span>
        <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
          Claim Card
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        No encontramos esta información en el catálogo Data360 del Banco
        Mundial. Verifacta no inventa datos.
      </p>
      <dl className="space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-slate-500 shrink-0 w-14">Fecha</dt>
          <dd className="text-slate-300">{humanTimestamp(data.timestamp)}</dd>
        </div>
      </dl>
    </div>
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
      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
