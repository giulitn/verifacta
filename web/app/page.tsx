type BackendStatus = {
  reachable: boolean;
  origin: string | null;
  body: string | null;
};

async function checkBackend(): Promise<BackendStatus> {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim() || null;
  if (!origin) return { reachable: false, origin: null, body: null };
  try {
    const res = await fetch(`${origin}/health`, { cache: "no-store" });
    const body = await res.text();
    return { reachable: res.ok, origin, body };
  } catch {
    return { reachable: false, origin, body: null };
  }
}

export default async function Home() {
  const backend = await checkBackend();
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Verifacta</h1>
          <p className="text-sm text-neutral-600">
            Phase 0 — connectivity check
          </p>
        </header>

        <section className="rounded-lg border border-neutral-200 p-4 space-y-3">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-neutral-500">Backend URL</span>
            <span className="font-mono text-xs">
              {backend.origin ?? "(unset)"}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-neutral-500">Reachable</span>
            <span
              className={
                backend.reachable
                  ? "text-green-700 font-medium"
                  : "text-red-700 font-medium"
              }
            >
              {backend.reachable ? "yes" : "no"}
            </span>
          </div>
          {backend.body && (
            <pre className="bg-neutral-50 rounded p-2 text-xs overflow-auto">
              {backend.body}
            </pre>
          )}
        </section>

        <footer className="text-xs text-neutral-500">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> in{" "}
          <code className="font-mono">web/.env.local</code> (local) or in
          Vercel project settings (prod).
        </footer>
      </div>
    </main>
  );
}
