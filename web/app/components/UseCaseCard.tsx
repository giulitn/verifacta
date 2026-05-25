"use client";

type Props = {
  icon: string;
  text: string;
  onClick: () => void;
};

/**
 * One-tap example query. Clicking populates the search input above the fold.
 * Designed for journalists who land on the page without knowing what to ask.
 */
export default function UseCaseCard({ icon, text, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Probar ejemplo: ${text}`}
      className="group flex items-start gap-3 p-4 text-left bg-white border border-neutral-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <span className="text-2xl leading-none shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
        {text}
      </span>
    </button>
  );
}
