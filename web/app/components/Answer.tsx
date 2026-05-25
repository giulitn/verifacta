import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckIcon } from "./Icons";

type Props = {
  text: string;
};

/**
 * Prominent rendering of the verified answer.
 *
 * The agent's answers are markdown (bold, tables, lists) — rendering as
 * plain text leaves the user staring at literal `**` and pipe characters
 * instead of structured information. react-markdown + remark-gfm parses
 * the GitHub-flavored markdown the LLM emits; the `components` map skins
 * each element so the result still matches the Verifacta look.
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

      <article className="pr-24 text-neutral-900 text-base sm:text-[1.0625rem] leading-relaxed space-y-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {text}
        </ReactMarkdown>
      </article>
    </section>
  );
}

export const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="my-2" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-neutral-900" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="text-neutral-700" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc pl-5 my-2 space-y-1" />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal pl-5 my-2 space-y-1" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-neutral-800" />
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="text-lg font-semibold text-neutral-900 mt-4 mb-2" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-base font-semibold text-neutral-900 mt-4 mb-2" />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 {...props} className="text-sm font-semibold text-neutral-900 mt-3 mb-1" />
  ),
  code: ({
    inline,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    if (inline === false) {
      return (
        <code
          {...rest}
          className="block bg-neutral-50 border border-neutral-200 rounded-md p-3 text-xs font-mono text-neutral-800 overflow-x-auto"
        />
      );
    }
    return (
      <code
        {...rest}
        className="font-mono text-[0.85em] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded"
      />
    );
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 -mx-1 overflow-x-auto">
      <table
        {...props}
        className="w-full text-sm border-collapse text-left"
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} className="bg-neutral-50 border-b border-neutral-200" />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600"
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      {...props}
      className="px-3 py-1.5 border-b border-neutral-100 text-neutral-800"
    />
  ),
  hr: () => <hr className="my-4 border-t border-neutral-200" />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-emerald-700 underline decoration-dotted hover:text-emerald-900"
      target="_blank"
      rel="noreferrer"
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-2 border-neutral-300 pl-3 my-3 text-neutral-600 italic"
    />
  ),
};
