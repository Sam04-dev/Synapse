"use client";

interface DataPoint {
  day: string;
  count: number;
}

interface Props {
  data: DataPoint[];
}

export default function LineChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground/50 uppercase">NO DATA</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 400;
  const h = 160;
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.top + ch - (d.count / max) * ch,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${pad.top + ch} L ${points[0].x} ${pad.top + ch} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(20 90% 50%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(20 90% 50%)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pad.top + ch * (1 - f);
        return (
          <g key={f}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="hsl(0 0% 20%)" strokeWidth="0.5" />
            <text x={pad.left - 5} y={y + 3} textAnchor="end" fill="hsl(0 0% 40%)" fontSize="8" fontFamily="monospace">
              {Math.round(max * f)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <text
          key={d.day}
          x={points[i].x}
          y={h - 5}
          textAnchor="middle"
          fill="hsl(0 0% 40%)"
          fontSize="8"
          fontFamily="monospace"
        >
          {d.day}
        </text>
      ))}
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="hsl(20 90% 50%)" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(0 0% 6%)" stroke="hsl(20 90% 50%)" strokeWidth="2" />
      ))}
    </svg>
  );
}
