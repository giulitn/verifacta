"use client";

import { useEffect, useId, useState } from "react";

type Props = {
  chart: string;
};

/**
 * Renders a Mermaid diagram client-side.
 *
 * Mermaid relies on the browser DOM (it injects SVG via JS), so we
 * dynamic-import it inside an effect to keep it out of the SSR bundle.
 * Each render uses a fresh `id` so two diagrams on the same page never
 * collide.
 */
export default function MermaidDiagram({ chart }: Props) {
  const reactId = useId();
  const safeId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          themeVariables: {
            primaryColor: "#f0fdf4",
            primaryBorderColor: "#16a34a",
            primaryTextColor: "#111827",
            lineColor: "#737373",
            tertiaryColor: "#f8f9fa",
          },
        });
        const { svg } = await mermaid.render(safeId, chart);
        if (!cancelled) setSvg(svg);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, safeId]);

  if (error) {
    return (
      <pre className="bg-red-50 border border-red-200 rounded-md p-4 my-4 text-xs text-red-800 overflow-x-auto">
        Diagram failed to render:{"\n"}
        {error}
      </pre>
    );
  }

  return (
    <figure
      className="my-6 not-prose rounded-xl border border-neutral-200 bg-white p-4 overflow-x-auto"
      // mermaid emits sanitized SVG, dangerouslySetInnerHTML is safe here.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
