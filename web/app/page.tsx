import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[2px] text-neutral-500">
            DATA 360 Global Challenge 2026
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Verifacta</h1>
          <p className="text-lg text-neutral-600">
            A verification layer for journalists. Every answer is grounded in
            the official World Bank Data360 catalogue and ships with a signed
            Claim Card — sources cited, integrity hash included.
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm text-neutral-700">
            We do not paraphrase, summarize, or generate. When the data isn't
            in Data360, Verifacta refuses on the record — and shows you the
            closest indicator you could ask about instead.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/chat"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Open the verifier →
          </Link>
          <a
            href="https://github.com/giulitn/verifacta"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-white"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
