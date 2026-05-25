import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "../components/Logo";
import DocsNav from "./DocsNav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.06] bg-[#0a0f1a]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-1 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Volver al verificador">
            <Logo className="w-[160px] h-auto" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Try the verifier
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <DocsNav />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-white/[0.06] mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-xs text-slate-500 flex flex-wrap justify-between gap-4">
          <span>Verifacta · DATA 360 Global Challenge 2026</span>
          <a
            href="https://github.com/giulitn/verifacta"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white underline decoration-dotted transition-colors"
          >
            github.com/giulitn/verifacta
          </a>
        </div>
      </footer>
    </div>
  );
}
