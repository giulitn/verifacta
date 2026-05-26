import {
  Building2,
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
    topics: [
      "Educación",
      "Salud, nutrición y población",
      "Género",
      "Protección social",
    ],
  },
  {
    Icon: TrendingUp,
    name: "Prosperidad",
    href: "https://data360.worldbank.org/en/prosperity",
    topics: [
      "Política económica",
      "Crecimiento y empleo",
      "Finanzas",
      "Pobreza",
      "Comercio e inversión",
      "Instituciones",
    ],
  },
  {
    Icon: Globe,
    name: "Planeta",
    href: "https://data360.worldbank.org/en/planet",
    topics: [
      "Cambio climático",
      "Medio ambiente",
      "Agua",
      "Agricultura y alimentos",
    ],
  },
  {
    Icon: Building2,
    name: "Infraestructura",
    href: "https://data360.worldbank.org/en/infrastructure",
    topics: [
      "Energía",
      "Transporte",
      "Resiliencia urbana y suelo",
      "Financiamiento de infraestructura",
    ],
  },
  {
    Icon: Cpu,
    name: "Digital",
    href: "https://data360.worldbank.org/en/digital",
    topics: [
      "Conectividad",
      "Ciberseguridad",
      "Servicios digitales",
      "Industria y empleo digital",
      "Infraestructura de datos",
    ],
  },
];

export default function ThemesSection() {
  return (
    <section aria-label="Temas sobre los que podés preguntar" className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
          ¿Sobre qué podés preguntar?
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Cinco grandes temas, miles de indicadores
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Verifacta consulta el catálogo Data360 del Banco Mundial, que
          organiza sus datos en cinco temas. Si tu pregunta cae acá adentro,
          probablemente tengamos respuesta.
        </p>
      </div>

      <ul className="space-y-2.5">
        {THEMES.map((theme) => (
          <li key={theme.name}>
            <a
              href={theme.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-[#131f2c] border border-white/[0.08] hover:border-emerald-500/30 rounded-xl px-4 py-3.5 transition-colors"
            >
              <div className="flex items-center gap-3 sm:min-w-[180px]">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 shrink-0"
                >
                  <theme.Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <span className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {theme.name}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed sm:flex-1">
                {theme.topics.join(" · ")}
              </p>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500 leading-relaxed">
        Los temas y subcategorías vienen directo de{" "}
        <a
          href="https://data360.worldbank.org"
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 underline decoration-dotted hover:text-slate-200"
        >
          data360.worldbank.org
        </a>
        . Si tu pregunta cae fuera, Verifacta te lo dice antes que inventarte
        una respuesta.
      </p>
    </section>
  );
}
