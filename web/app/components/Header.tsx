import { Baby, TrendingUp, Zap } from "lucide-react";
import Logo from "./Logo";
import Typewriter from "./Typewriter";
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
            <Typewriter
              text="verificados al instante."
              className="text-emerald-400"
            />
          </h1>
          <p className="font-serif text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Cada respuesta viene directo del Banco Mundial: el número exacto,
            la fuente oficial, y un sello que prueba que nadie lo tocó. No se
            agrega contexto, no se infieren datos y te entregamos un sello
            para que puedas incrustarlo en X, un sitio web, un blog o incluso
            un libro escrito a mano, como sello de información verificada.
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
