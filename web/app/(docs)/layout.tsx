import Link from "next/link";
import { ArrowRightIcon } from "../components/Icons";

const DOC_PAGES = [
  { href: "/architecture", title: "Architecture" },
  { href: "/methodology", title: "Methodology" },
  { href: "/security", title: "Security" },
  { href: "/user-guide", title: "User guide" },
  { href: "/sustainability", title: "Sustainability" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-bold tracking-tight text-neutral-900 hover:text-emerald-700"
          >
            Verifacta
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Try the verifier
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <nav
          aria-label="Documentation"
          className="max-w-3xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap gap-x-5 gap-y-2"
        >
          {DOC_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-neutral-100 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-xs text-neutral-500 flex flex-wrap justify-between gap-4">
          <span>Verifacta · DATA 360 Global Challenge 2026</span>
          <a
            href="https://github.com/giulitn/verifacta"
            target="_blank"
            rel="noreferrer"
            className="hover:text-neutral-900 underline decoration-dotted"
          >
            github.com/giulitn/verifacta
          </a>
        </div>
      </footer>
    </div>
  );
}
