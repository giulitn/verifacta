"use client";

import { Baby, TrendingUp, Zap } from "lucide-react";
import UseCaseCard from "./UseCaseCard";

type Props = {
  onPick: (query: string) => void;
};

const EXAMPLES = [
  { Icon: TrendingUp, text: "¿Cuál fue el PBI de Argentina en 2022?" },
  { Icon: Baby, text: "Mortalidad infantil en América Latina" },
  { Icon: Zap, text: "Acceso a electricidad en África" },
];

export default function ExampleQueries({ onPick }: Props) {
  return (
    <section aria-label="Ejemplos de consultas" className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[2px] text-slate-500">
        Probá con un ejemplo
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXAMPLES.map((example) => (
          <UseCaseCard
            key={example.text}
            Icon={example.Icon}
            text={example.text}
            onClick={() => onPick(example.text)}
          />
        ))}
      </div>
    </section>
  );
}
