import UseCaseCard from "./UseCaseCard";

type Props = {
  onPickExample: (query: string) => void;
};

const EXAMPLES = [
  { icon: "💰", text: "¿Cuál fue el PBI de Argentina en 2022?" },
  { icon: "👶", text: "Mortalidad infantil en América Latina" },
  { icon: "⚡", text: "Acceso a electricidad en África" },
];

export default function Header({ onPickExample }: Props) {
  return (
    <header className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
          Verifacta
        </h1>
        <p className="text-base text-neutral-600">
          Consultá datos del Banco Mundial. Cada respuesta viene verificada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXAMPLES.map((example) => (
          <UseCaseCard
            key={example.text}
            icon={example.icon}
            text={example.text}
            onClick={() => onPickExample(example.text)}
          />
        ))}
      </div>
    </header>
  );
}
