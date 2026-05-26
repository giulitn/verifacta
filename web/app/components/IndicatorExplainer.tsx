import { ArrowRight } from "lucide-react";

export default function IndicatorExplainer() {
  return (
    <section
      aria-label="Qué es un indicador"
      className="bg-[#131f2c] border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
          Lo más importante
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          ¿Qué es un indicador?
        </h2>
        <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
          Es una medición concreta que publica el Banco Mundial — por ejemplo,{" "}
          <span className="text-white">la esperanza de vida al nacer</span> o{" "}
          <span className="text-white">el PBI per cápita</span>. Cada una tiene
          un nombre legible y un código único que la identifica en la base
          oficial. Verifacta siempre te muestra los dos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-stretch">
        <div className="bg-[#0a0f1a] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-slate-500">
            Nombre legible
          </p>
          <p className="text-base text-white leading-snug">
            Esperanza de vida al nacer
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cómo lo entiende cualquier persona.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="hidden sm:flex items-center justify-center text-slate-600"
        >
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
        </div>

        <div className="bg-[#0a0f1a] border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-emerald-400/80">
            Código oficial
          </p>
          <p className="text-base text-emerald-300 leading-snug font-mono">
            WB_WDI_SP_DYN_LE00_IN
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cómo lo busca el Banco Mundial en su base de datos.
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed">
        Mostrar el código no es un detalle técnico: es lo que te permite
        buscarlo en{" "}
        <a
          href="https://data360.worldbank.org/en/search"
          target="_blank"
          rel="noreferrer"
          className="text-slate-300 underline decoration-dotted hover:text-white"
        >
          data360.worldbank.org/search
        </a>{" "}
        y comprobar el dato vos mismo. Sin intermediarios, sin confiar en
        nuestra palabra.
      </p>
    </section>
  );
}
