import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  text: string;
};

export default function Answer({ text }: Props) {
  return (
    <section
      aria-label="Respuesta verificada"
      className="relative bg-[#131f2c] border border-emerald-500/20 rounded-xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(34,197,94,0.08)]"
    >
      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-500/[0.12] border border-emerald-500/30 rounded-full">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Verificado
      </span>

      <article className="pr-24 text-slate-100 text-base sm:text-[1.0625rem] leading-relaxed">
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
    <p {...props} className="my-2 text-slate-100" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-white" />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="text-slate-300" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc pl-5 my-2 space-y-1 text-slate-200" />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal pl-5 my-2 space-y-1 text-slate-200" />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-slate-200" />
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="text-lg font-semibold text-white mt-4 mb-2" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-base font-semibold text-white mt-4 mb-2" />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 {...props} className="text-sm font-semibold text-white mt-3 mb-1" />
  ),
  code: ({
    inline,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    if (inline === false) {
      return (
        <code
          {...rest}
          className="block bg-black/30 border border-white/[0.06] rounded-md p-3 text-xs font-mono text-slate-300 overflow-x-auto"
        />
      );
    }
    return (
      <code
        {...rest}
        className="font-mono text-[0.85em] text-emerald-300 bg-emerald-500/[0.08] px-1 py-0.5 rounded"
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
    <thead {...props} className="bg-white/[0.04] border-b border-white/[0.08]" />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400"
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      {...props}
      className="px-3 py-1.5 border-b border-white/[0.04] text-slate-200"
    />
  ),
  hr: () => <hr className="my-4 border-t border-white/[0.08]" />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-emerald-300 underline decoration-dotted hover:text-emerald-200"
      target="_blank"
      rel="noreferrer"
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-2 border-emerald-500/40 pl-3 my-3 text-slate-300 italic"
    />
  ),
};
