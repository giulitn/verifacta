import { Database, MessageSquare, ShieldCheck, type LucideIcon } from "lucide-react";

type Step = {
  Icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    Icon: MessageSquare,
    title: "Hacé tu pregunta",
    body: "En lenguaje natural, sin formato técnico. Datos puntuales, comparaciones o series históricas.",
  },
  {
    Icon: Database,
    title: "Consultamos al Banco Mundial",
    body: "Verifacta busca el indicador, lo trae del catálogo oficial Data360 y lo cita literal — sin paráfrasis.",
  },
  {
    Icon: ShieldCheck,
    title: "Recibís una respuesta verificada",
    body: "Con su fuente, fecha exacta y una firma criptográfica para que cualquiera pueda corroborarla.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-label="Cómo funciona Verifacta" className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
        Cómo funciona
      </p>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="bg-[#131f2c] border border-white/[0.08] rounded-xl p-5 space-y-3 hover:border-white/[0.16] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400"
              >
                <step.Icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-mono text-slate-600">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-slate-500 italic">
        Verifacta no genera ni inventa datos. Solo consulta el catálogo
        oficial del Banco Mundial y firma cada respuesta.
      </p>
    </section>
  );
}
