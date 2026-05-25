import type { ClaimCardData } from "../lib/types";

/**
 * Renders the SHA-256-signed Claim Card in one of two variants:
 *   - verified: at least one indicator was cited → black border, green badge
 *   - rejected: no indicators (agent refused or got no usable data) → red
 *
 * Visual style mirrors langgraph_agent/templates/claim_card.html and
 * rejection_card.html so the on-screen artifact matches the downloadable
 * HTML when we ship that feature.
 */
export default function ClaimCard({
  answer,
  indicators,
  timestamp,
  sha256,
}: ClaimCardData) {
  const verified = indicators.length > 0;

  return (
    <article
      className={`font-mono bg-white border-2 rounded-lg p-8 max-w-[780px] w-full ${
        verified
          ? "border-[#1a1a2e] shadow-[4px_4px_0_#1a1a2e]"
          : "border-[#c62828] shadow-[4px_4px_0_#c62828]"
      }`}
    >
      <header className="mb-4">
        <h2 className="text-lg uppercase tracking-[1px] text-[#1a1a2e] m-0">
          Verifacta
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          DATA 360 Global Challenge · Claim Card
        </p>
      </header>

      <Badge verified={verified} />

      {!verified && (
        <p className="text-xs text-neutral-500 italic bg-red-50 border-l-[3px] border-[#c62828] px-3 py-2.5 mb-5">
          The query could not be answered with verified statistics from the
          World Bank Data360 catalogue. No data tools returned a citable
          value.
        </p>
      )}

      <Field label={verified ? "Verified Answer" : "Agent Response"}>
        {answer}
      </Field>

      <hr className="border-0 border-t border-dashed border-neutral-300 my-6" />

      {verified && (
        <Field label={`Sources consulted (${indicators.length})`}>
          <div className="space-y-1">
            {indicators.map((c, i) => (
              <div
                key={`${c.database}-${c.indicator}-${i}`}
                className="text-sm bg-neutral-50 border-l-[3px] border-green-700 px-2 py-1.5 break-all"
              >
                <span className="text-neutral-600">{c.database}</span>
                <span className="text-neutral-400 mx-2">::</span>
                <span className="text-[#1a1a2e] font-bold">{c.indicator}</span>
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field label="Timestamp (UTC)">{timestamp}</Field>
      <Field label="SHA-256 Integrity Hash">
        <span className="text-green-700 break-all text-[0.78rem]">{sha256}</span>
      </Field>
    </article>
  );
}

function Badge({ verified }: { verified: boolean }) {
  const styles = verified
    ? "bg-green-700 text-white"
    : "bg-[#c62828] text-white";
  const label = verified ? "✓ Verified" : "⚠ No verified data";
  return (
    <span
      className={`inline-block ${styles} text-xs font-bold uppercase tracking-[1px] px-2.5 py-1 rounded mb-6`}
    >
      {label}
    </span>
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
    <div className="mb-5">
      <div className="text-xs font-bold uppercase tracking-[1px] text-neutral-600 mb-1.5">
        {label}
      </div>
      <div className="text-[0.95rem] text-[#1a1a2e] whitespace-pre-wrap break-words">
        {children}
      </div>
    </div>
  );
}
