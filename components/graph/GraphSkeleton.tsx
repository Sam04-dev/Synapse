"use client";

export default function GraphSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="relative" style={{ width: 180, height: 140 }}>
        <div className="animate-skeleton-node absolute border-2 border-foreground/10" style={{ width: 80, height: 36, left: 50, top: 0, background: "rgba(255,255,255,0.05)" }} />
        <div className="animate-skeleton-node absolute border-2 border-foreground/10" style={{ width: 80, height: 36, left: 0, top: 80, background: "rgba(255,255,255,0.05)", animationDelay: "0.3s" }} />
        <div className="animate-skeleton-node absolute border-2 border-foreground/10" style={{ width: 80, height: 36, left: 100, top: 80, background: "rgba(255,255,255,0.05)", animationDelay: "0.6s" }} />
      </div>
      <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground animate-pulse">
        INITIALIZING NEURAL MAP...
      </p>
    </div>
  );
}
