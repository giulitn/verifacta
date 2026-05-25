"use client";

import { useEffect, useId, useState } from "react";

type Props = {
  chart: string;
};

/**
 * Renders a Mermaid diagram client-side, themed to match the dark UI.
 *
 * Mermaid relies on the browser DOM, so we dynamic-import it inside
 * an effect to keep it out of the SSR bundle. Each render uses a fresh
 * `id` so two diagrams on the same page never collide.
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
          theme: "dark",
          darkMode: true,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          themeVariables: {
            background: "#0a0f1a",
            primaryColor: "#131f2c",
            primaryBorderColor: "#22c55e",
            primaryTextColor: "#f9fafb",
            secondaryColor: "#1a2738",
            secondaryBorderColor: "rgba(255,255,255,0.12)",
            lineColor: "#64748b",
            textColor: "#cbd5e1",
            mainBkg: "#131f2c",
            nodeBorder: "rgba(255,255,255,0.16)",
            clusterBkg: "rgba(255,255,255,0.02)",
            clusterBorder: "rgba(255,255,255,0.08)",
            edgeLabelBackground: "#0a0f1a",
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
      <pre className="bg-red-500/[0.08] border border-red-500/30 rounded-md p-4 my-4 text-xs text-red-300 overflow-x-auto">
        Diagram failed to render:{"\n"}
        {error}
      </pre>
    );
  }

  return (
    <figure
      className="my-6 not-prose rounded-xl border border-white/[0.08] bg-[#131f2c] p-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
