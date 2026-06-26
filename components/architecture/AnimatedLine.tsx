"use client";

interface Props {
  direction?: "right" | "down-right";
  color: string;
  label?: string;
}

export default function AnimatedLine({
  direction = "right",
  color,
  label,
}: Props) {
  if (direction === "down-right") {
    return (
      <div className="flex flex-col items-center shrink-0 w-16">
        {label && (
          <span className="text-[9px] font-mono text-zinc-600 mb-1 tracking-wider">
            {label}
          </span>
        )}
        <div className="relative w-px h-10 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent, ${color}40, transparent)` }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full left-1/2 -translate-x-1/2"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: "flowDown 1.5s linear infinite",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center shrink-0 mx-1">
      {label && (
        <span className="text-[9px] font-mono text-zinc-600 mb-1 tracking-wider">
          {label}
        </span>
      )}
      <div className="relative h-px w-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full top-1/2 -translate-y-1/2"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
            animation: "flowRight 1.5s linear infinite",
          }}
        />
      </div>
      <span className="text-zinc-700 text-xs mt-0.5">→</span>
    </div>
  );
}
