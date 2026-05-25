type Props = {
  /** Show tagline under the wordmark. Off by default for compact placements. */
  showTagline?: boolean;
  /** Light text on dark bg (default) or dark text on light bg. */
  variant?: "dark" | "light";
  className?: string;
};

/**
 * Verifacta brand mark: rotated stamp + green accent dot + serif wordmark.
 * Extracted from the brand SVG so it travels with the bundle (no remote
 * font, no external image) and can be re-coloured per-variant.
 */
export default function Logo({
  showTagline = false,
  variant = "dark",
  className = "",
}: Props) {
  const colors = variant === "dark" ? DARK : LIGHT;

  return (
    <svg
      viewBox="0 0 280 64"
      role="img"
      aria-label="Verifacta"
      className={className}
    >
      {/* Stamp glyph: rotated rounded square + check + green accent dot */}
      <g transform="translate(28, 32)">
        <rect
          x="-20"
          y="-20"
          width="40"
          height="40"
          rx="4"
          fill="none"
          stroke={colors.glyph}
          strokeWidth="2.2"
          transform="rotate(45)"
        />
        <polyline
          points="-8,1 -2,8 9,-7"
          fill="none"
          stroke={colors.glyph}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="-15" r="4" fill={colors.accent} />
      </g>

      {/* Wordmark in Georgia serif so we don't depend on a web font */}
      <text
        x="70"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.02em"
        fill={colors.wordmark}
      >
        Verifacta
      </text>

      {showTagline && (
        <text
          x="70"
          y="56"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          fontSize="8.5"
          letterSpacing="0.22em"
          fill={colors.tagline}
        >
          DATOS VERIFICADOS · WORLD BANK DATA360
        </text>
      )}
    </svg>
  );
}

const DARK = {
  glyph: "#f9fafb",
  accent: "#22c55e",
  wordmark: "#f9fafb",
  tagline: "rgba(255,255,255,0.4)",
};

const LIGHT = {
  glyph: "#111827",
  accent: "#16a34a",
  wordmark: "#111827",
  tagline: "#6b7280",
};
