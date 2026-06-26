"use client";

const COLORS: Record<string, string> = {
  user: "#3b82f6", action: "#f97316",
  strategy: "#a855f7", memory: "#71717a",
};

export { COLORS as MINI_COLORS };

export function MiniMapNode({ x, y, width, height, color }: {
  x: number; y: number; width: number; height: number; color: string;
}) {
  const cx = x + width / 2, cy = y + height / 2;
  const s = Math.min(width, height) / 2;
  if (color === COLORS.user)
    return <circle cx={cx} cy={cy} r={s} fill={color} />;
  if (color === COLORS.action)
    return <polygon points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`} fill={color} />;
  if (color === COLORS.strategy) {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill={color} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={color} rx={1} />;
}
