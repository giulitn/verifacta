import { Baby, TrendingUp, Zap } from "lucide-react";
import Logo from "./Logo";
import UseCaseCard from "./UseCaseCard";

type Props = {
  onPickExample: (query: string) => void;
};

const EXAMPLES = [
  { Icon: TrendingUp, text: "¿Cuál fue el PBI de Argentina en 2022?" },
  { Icon: Baby, text: "Mortalidad infantil en América Latina" },
  { Icon: Zap, text: "Acceso a electricidad en África" },
];

export default function Header({ onPickExample }: Props) {
  return (
    <header className="space-y-10">
      <div className="space-y-6">
        <Logo showTagline className="w-[280px] h-auto" />

        <div className="space-y-3 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
            Datos del Banco Mundial,
            <br />
            <span className="text-emerald-400">verificados al instante</span>.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Sin invento, sin paráfrasis, sin atajos. Cada respuesta cita su
            indicador y viene firmada criptográficamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXAMPLES.map((example) => (
          <UseCaseCard
            key={example.text}
            Icon={example.Icon}
            text={example.text}
            onClick={() => onPickExample(example.text)}
          />
        ))}
      </div>
    </header>
  );
}
