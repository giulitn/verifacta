import { Database, MessageSquare, ShieldCheck, type LucideIcon } from "lucide-react";

type Step = {
  Icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    Icon: MessageSquare,
    title: "Hacés tu pregunta",
    body: "En lenguaje natural, como le preguntarías a un colega.",
  },
  {
    Icon: Database,
    title: "Buscamos el dato oficial",
    body: "Consultamos el catálogo Data360 del Banco Mundial en tiempo real.",
  },
  {
    Icon: ShieldCheck,
    title: "Recibís la respuesta sellada",
    body: "Con fuente exacta y una firma matemática única. Si cambia una sola letra del dato o de la fuente, la firma deja de coincidir.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-label="Cómo funciona Verifacta" className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">
        Cómo funciona
      </p>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="space-y-2.5">
            <div className="flex items-center gap-3">
              <step.Icon
                aria-hidden="true"
                className="w-5 h-5 text-emerald-400"
                strokeWidth={1.5}
              />
              <span className="text-[11px] font-mono text-slate-600">
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
    </section>
  );
}
