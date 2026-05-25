import { highlightNumbers } from "../lib/numbers";
import { CheckIcon } from "./Icons";

type Props = {
  text: string;
};

/**
 * Prominent rendering of the verified answer. This is the first thing
 * a journalist sees once the agent finishes — large, sans-serif,
 * readable, with key numbers visually accented.
 */
export default function Answer({ text }: Props) {
  return (
    <section
      aria-label="Respuesta verificada"
      className="relative bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
        <CheckIcon className="h-3.5 w-3.5" />
        Verificado
      </span>

      <p className="text-lg sm:text-[1.125rem] leading-relaxed text-neutral-900 pr-24">
        {highlightNumbers(text)}
      </p>
    </section>
  );
}
