"use client";

export default function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 border border-foreground/15 bg-card/95 backdrop-blur-sm px-3 py-2.5">
      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60 mb-2">
        LEGEND
      </p>
      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-zinc-500 bg-zinc-900 shrink-0" />
          <span className="text-[11px] font-mono text-muted-foreground">Memory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-blue-950/60 shrink-0" />
          <span className="text-[11px] font-mono text-muted-foreground">User</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rotate-45 border-2 border-orange-500 bg-orange-950/50 shrink-0" />
          <span className="text-[11px] font-mono text-muted-foreground">Action</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-purple-500 shrink-0" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          <span className="text-[11px] font-mono text-muted-foreground">Strategy</span>
        </div>
      </div>
    </div>
  );
}
