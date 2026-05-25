import type { MDXComponents } from "mdx/types";

/**
 * Default component mappings for every .mdx file in the App Router.
 * Each docs page can still override on a per-instance basis.
 *
 * This file MUST live at the project root (next to package.json) so
 * Next.js picks it up automatically — that's a framework convention.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        {...props}
        className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mt-2 mb-2"
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className="text-xl sm:text-2xl font-semibold text-neutral-900 mt-10 mb-3"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className="text-base font-semibold text-neutral-900 mt-6 mb-2"
      />
    ),
    p: (props) => (
      <p {...props} className="my-3 text-neutral-800 leading-relaxed" />
    ),
    ul: (props) => (
      <ul {...props} className="list-disc pl-6 my-3 space-y-1.5 text-neutral-800" />
    ),
    ol: (props) => (
      <ol {...props} className="list-decimal pl-6 my-3 space-y-1.5 text-neutral-800" />
    ),
    li: (props) => <li {...props} className="leading-relaxed" />,
    a: (props) => (
      <a
        {...props}
        className="text-emerald-700 underline decoration-dotted hover:text-emerald-900"
      />
    ),
    strong: (props) => (
      <strong {...props} className="font-semibold text-neutral-900" />
    ),
    em: (props) => <em {...props} className="text-neutral-700" />,
    code: (props) => (
      <code
        {...props}
        className="font-mono text-[0.85em] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded"
      />
    ),
    pre: (props) => (
      <pre
        {...props}
        className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 my-4 overflow-x-auto text-xs font-mono leading-relaxed"
      />
    ),
    blockquote: (props) => (
      <blockquote
        {...props}
        className="border-l-2 border-neutral-300 pl-4 my-4 text-neutral-700 italic"
      />
    ),
    hr: () => <hr className="my-8 border-t border-neutral-200" />,
    table: (props) => (
      <div className="my-4 overflow-x-auto">
        <table {...props} className="w-full text-sm border-collapse" />
      </div>
    ),
    thead: (props) => (
      <thead {...props} className="bg-neutral-50 border-b border-neutral-200" />
    ),
    th: (props) => (
      <th
        {...props}
        className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600"
      />
    ),
    td: (props) => (
      <td
        {...props}
        className="px-3 py-2 border-b border-neutral-100 text-neutral-800 align-top"
      />
    ),
    ...components,
  };
}
