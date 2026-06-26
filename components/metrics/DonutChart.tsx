"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
}

export default function DonutChart({ segments }: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = 80;
  const cy = 80;
  const r = 60;
  const inner = 38;
  let angle = -90;

  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const start = (angle * Math.PI) / 180;
    angle += pct * 360;
    const end = (angle * Math.PI) / 180;
    const large = pct > 0.5 ? 1 : 0;
    return {
      ...seg,
      d: `M ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)}
          A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)}
          L ${cx + inner * Math.cos(end)} ${cy + inner * Math.sin(end)}
          A ${inner} ${inner} 0 ${large} 0 ${cx + inner * Math.cos(start)} ${cy + inner * Math.sin(start)} Z`,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill={a.color} opacity="0.85" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="hsl(43 23% 93%)" fontSize="18" fontFamily="monospace" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(0 0% 50%)" fontSize="8" fontFamily="monospace" letterSpacing="0.15em">
          TOTAL
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5" style={{ background: s.color }} />
            <span className="text-xs font-mono text-muted-foreground">{s.label}</span>
            <span className="text-xs font-mono text-foreground/70 ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
