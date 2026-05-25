/**
 * Empty state shown before the first query — explains the flow at a
 * glance so a first-time visitor doesn't have to read docs to trust
 * the tool.
 */

const STEPS = [
  {
    icon: "🔍",
    title: "Hacé tu pregunta",
    body: "En lenguaje natural, sin formato técnico. Podés pedir datos puntuales, comparaciones o series históricas.",
  },
  {
    icon: "⚙️",
    title: "Consultamos al Banco Mundial",
    body: "Verifacta busca el indicador, lo trae del catálogo oficial Data360 y lo cita literal — sin paráfrasis.",
  },
  {
    icon: "📋",
    title: "Recibís una respuesta verificada",
    body: "Con su fuente, fecha exacta y una firma criptográfica para que cualquiera pueda corroborarla.",
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-label="Cómo funciona Verifacta"
      className="space-y-5"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        ¿Cómo funciona?
      </h2>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="bg-white border border-neutral-200 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none" aria-hidden="true">
                {step.icon}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {step.title}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-neutral-500 italic">
        Verifacta no genera ni inventa datos. Solo consulta el catálogo
        oficial del Banco Mundial y firma cada respuesta.
      </p>
    </section>
  );
}
