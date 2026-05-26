import Logo from "./Logo";
import Typewriter from "./Typewriter";

export default function Header() {
  return (
    <header className="space-y-6">
      <Logo showTagline className="w-[280px] h-auto" />

      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
          Datos del Banco Mundial,
          <br />
          <Typewriter
            text="verificados al instante."
            className="text-emerald-400"
          />
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Nada inventado, nada resumido. Te decimos exactamente de dónde viene
          cada dato y le ponemos un sello: si alguien lo cambia, se nota.
        </p>
      </div>
    </header>
  );
}
