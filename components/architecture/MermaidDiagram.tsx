"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
}

export default function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            darkMode: true,
            background: "#09090b",
            mainBkg: "#18181b",
            nodeBorder: "#3f3f46",
            clusterBkg: "#09090b",
            clusterBorder: "#3f3f46",
            titleColor: "#e4e4e7",
            edgeLabelBackground: "#18181b",
            primaryColor: "#18181b",
            primaryTextColor: "#e4e4e7",
            primaryBorderColor: "#3f3f46",
            lineColor: "#52525b",
            secondaryColor: "#27272a",
            tertiaryColor: "#18181b",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "12px",
          },
          flowchart: { curve: "basis", padding: 20 },
          securityLevel: "loose",
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          // Make SVG fill its container
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.style.maxWidth = "100%";
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Render failed");
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="border border-destructive/30 bg-destructive/10 p-4 rounded-lg">
        <p className="text-xs font-mono text-destructive">Diagram render error: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto [&_svg]:!max-w-full [&_.label]:!font-mono [&_text]:!fill-zinc-300"
    />
  );
}
