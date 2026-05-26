import {
  ArrowRight,
  Building2,
  ChevronDown,
  Cpu,
  Globe,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

type Theme = {
  Icon: LucideIcon;
  name: string;
  href: string;
  topics: string[];
};

const THEMES: Theme[] = [
  {
    Icon: Users,
    name: "Personas",
    href: "https://data360.worldbank.org/en/people",
    topics: ["Educación", "Salud, nutrición y población", "Género", "Protección social"],
  },
  {
    Icon: TrendingUp,
    name: "Prosperidad",
    href: "https://data360.worldbank.org/en/prosperity",
    topics: ["Política económica", "Crecimiento y empleo", "Finanzas", "Pobreza", "Comercio e inversión", "Instituciones"],
  },
  {
    Icon: Globe,
    name: "Planeta",
    href: "https://data360.worldbank.org/en/planet",
    topics: ["Cambio climático", "Medio ambiente", "Agua", "Agricultura y alimentos"],
  },
  {
    Icon: Building2,
    name: "Infraestructura",
    href: "https://data360.worldbank.org/en/infrastructure",
    topics: ["Energía", "Transporte", "Resiliencia urbana y suelo", "Financiamiento de infraestructura"],
  },
  {
    Icon: Cpu,
    name: "Digital",
    href: "https://data360.worldbank.org/en/digital",
    topics: ["Conectividad", "Ciberseguridad", "Servicios digitales", "Industria y empleo digital", "Infraestructura de datos"],
  },
];

export default function KnowledgeBase() {
  return (
    <details className="group bg-[#131f2c] border border-white/[0.08] rounded-2xl open:border-white/[0.14] transition-colors">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 select-none">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
            Para saber más
          </p>
          <p className="text-base font-semibold text-white">
            Qué es un indicador y sobre qué podés preguntar
          </p>
        </div>
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 text-slate-500 shrink-0 transition-transform group-open:rotate-180"
          strokeWidth={1.75}
        />
      </summary>

      <div className="px-6 pb-6 space-y-8 border-t border-white/[0.06] pt-6">
        <section aria-label="Qué es un indicador" className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              ¿Qué es un indicador?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Es una medición concreta que publica el Banco Mundial — por
              ejemplo,{" "}
              <span className="text-white">la esperanza de vida al nacer</span>{" "}
              o <span className="text-white">el PBI per cápita</span>. Cada una
              tiene un nombre legible y un código único que la identifica en la
              base oficial. Verifacta siempre te muestra los dos.
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

          <p className="text-xs text-slate-500 leading-relaxed">
            Mostrar el código no es un detalle técnico: es lo que te permite
            buscarlo en{" "}
            <a
              href="https://data360.worldbank.org/en/search"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 underline decoration-dotted hover:text-slate-200"
            >
              data360.worldbank.org/search
            </a>{" "}
            y comprobar el dato vos mismo.
          </p>
        </section>

        <section aria-label="Temas disponibles" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Cinco grandes temas, miles de indicadores
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Verifacta consulta el catálogo Data360 del Banco Mundial, que
              organiza sus datos en cinco temas. Si tu pregunta cae acá
              adentro, probablemente tengamos respuesta.
            </p>
          </div>

          <ul className="space-y-2">
            {THEMES.map((theme) => (
              <li key={theme.name}>
                <a
                  href={theme.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/theme flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-[#0a0f1a] border border-white/[0.08] hover:border-emerald-500/30 rounded-lg px-3.5 py-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:min-w-[160px]">
                    <theme.Icon
                      aria-hidden="true"
                      className="w-4 h-4 text-emerald-400 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm font-semibold text-white group-hover/theme:text-emerald-300 transition-colors">
                      {theme.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed sm:flex-1">
                    {theme.topics.join(" · ")}
                  </p>
                </a>
              </li>
            ))}
          </ul>

          <p className="text-xs text-slate-500 leading-relaxed">
            Si tu pregunta cae fuera, Verifacta te lo dice antes que inventarte
            una respuesta.
          </p>
        </section>
      </div>
    </details>
  );
}
