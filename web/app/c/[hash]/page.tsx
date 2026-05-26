import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Answer from "../../components/Answer";
import ClaimCard from "../../components/ClaimCard";
import Logo from "../../components/Logo";
import type { ClaimCardData } from "../../lib/types";

const HASH_RE = /^[a-f0-9]{64}$/;

type Props = { params: Promise<{ hash: string }> };

async function fetchClaim(hash: string): Promise<ClaimCardData | null> {
  if (!HASH_RE.test(hash)) return null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  // Claim Cards are content-addressable — same hash always points to the
  // same payload — so force-cache is safe and avoids hammering the API
  // when a tweet goes viral.
  const res = await fetch(`${apiUrl}/c/${hash}`, { cache: "force-cache" });
  if (!res.ok) return null;
  return (await res.json()) as ClaimCardData;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  const card = await fetchClaim(hash);

  if (!card) {
    return {
      title: "Claim no encontrada — Verifacta",
      description: "Esta Claim Card no existe o el link es inválido.",
    };
  }

  const summary = card.answer.length > 160
    ? `${card.answer.slice(0, 157)}…`
    : card.answer;
  const indicator = card.indicators[0]?.indicator;
  const description = indicator
    ? `Verificado contra ${indicator} en el Banco Mundial Data360.`
    : "Dato verificado por Verifacta.";

  return {
    title: `${summary} — Verifacta`,
    description,
    openGraph: {
      title: "Dato verificado",
      description: summary,
      type: "article",
      siteName: "Verifacta",
    },
    twitter: {
      card: "summary",
      title: "Dato verificado por Verifacta",
      description: summary,
    },
  };
}

export default async function ClaimPage({ params }: Props) {
  const { hash } = await params;
  if (!HASH_RE.test(hash)) notFound();

  const card = await fetchClaim(hash);
  if (!card) notFound();

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-x-0 top-0 h-[400px] hero-glow pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Verifacta — volver al verificador">
            <Logo className="w-[180px] h-auto" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Verificar otra cosa →
          </Link>
        </header>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
            Claim Card verificada
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Este dato vino del Banco Mundial
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Verifacta generó esta respuesta consultando el catálogo Data360 en
            la fecha indicada abajo. El link a la fuente oficial es la forma
            real de verificarla; la firma SHA-256 garantiza que este archivo
            no fue alterado desde que se emitió.
          </p>
        </section>

        <Answer text={card.answer} />
        <ClaimCard {...card} />

        <section
          aria-label="Cómo confiar en este dato"
          className="bg-[#131f2c] border border-white/[0.08] rounded-2xl p-6 space-y-3"
        >
          <h2 className="text-base font-semibold text-white">
            Cómo verificás esto sin confiar en Verifacta
          </h2>
          <ol className="space-y-2 text-sm text-slate-300 leading-relaxed list-decimal pl-5">
            <li>
              Hacé click en el código del indicador de arriba. Te lleva al
              Banco Mundial, a la página oficial del dato. Si el número
              coincide, está verificado.
            </li>
            <li>
              La firma SHA-256 se calcula a partir de la respuesta + las
              fuentes + el timestamp. Si Verifacta intentara cambiar lo que
              ves acá, la firma de esta misma URL dejaría de cuadrar — y
              cualquiera puede auditarlo recalculándola con los datos de
              arriba.
            </li>
          </ol>
        </section>

        <footer className="pt-6 mt-4 border-t border-white/[0.06] text-xs text-slate-500">
          <p>
            Verifacta · DATA 360 Global Challenge 2026 ·{" "}
            <Link
              href="/methodology"
              className="hover:text-slate-300 underline decoration-dotted"
            >
              Cómo funciona
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
