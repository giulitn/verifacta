import Link from "next/link";
import Logo from "../../components/Logo";

export default function ClaimNotFound() {
  return (
    <main className="min-h-screen relative">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <Link href="/" aria-label="Verifacta — volver al verificador">
          <Logo className="w-[180px] h-auto" />
        </Link>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-red-400">
            Claim no encontrada
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Este link no apunta a ninguna Claim Card
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            El hash que figura en la URL no coincide con ninguna respuesta
            que Verifacta haya emitido. Puede ser un link copiado mal, o
            una Claim Card emitida en otra instancia.
          </p>
        </section>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0a0f1a] bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
        >
          Verificar un dato
        </Link>
      </div>
    </main>
  );
}
