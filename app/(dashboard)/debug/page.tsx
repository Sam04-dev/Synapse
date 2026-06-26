"use client";

import { usePolling } from "@/lib/realtime";
import ErrorState from "@/components/ErrorState";

interface DebugData {
  dsql: { connected: boolean; error: string | null };
  dynamo: { connected: boolean };
  counts: { agents: number; memories: number; relationships: number };
  envVars: { key: string; set: boolean }[];
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
  );
}

const FLOW_STEPS = [
  { label: "Client", x: 30, color: "#71717a" },
  { label: "Next.js API", x: 160, color: "#f97316" },
  { label: "Aurora DSQL", x: 310, color: "#3b82f6" },
  { label: "DynamoDB", x: 460, color: "#a855f7" },
];

export default function DebugPage() {
  const { data, loading, error, refetch } = usePolling<DebugData>({
    url: "/api/debug",
    intervalMs: 5000,
  });

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="absolute inset-0 overflow-y-auto">
      {/* Red banner */}
      <div className="bg-destructive/15 border-b border-destructive/30 px-5 py-2">
        <p className="text-xs font-mono tracking-[0.15em] uppercase text-destructive font-bold">
          INTERNAL DEBUG PAGE — NOT FOR PRODUCTION
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <h1 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground">System Debug</h1>

        {/* Connection status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-foreground/10 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">AURORA DSQL</p>
              <StatusDot ok={data?.dsql.connected ?? false} />
            </div>
            <p className="text-sm font-mono text-foreground">
              {loading ? "Checking..." : data?.dsql.connected ? "Connected" : "Disconnected"}
            </p>
            {data?.dsql.error && (
              <p className="text-xs font-mono text-destructive mt-1 break-all">{data.dsql.error}</p>
            )}
          </div>
          <div className="border-2 border-foreground/10 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">DYNAMODB</p>
              <StatusDot ok={data?.dynamo.connected ?? false} />
            </div>
            <p className="text-sm font-mono text-foreground">
              {loading ? "Checking..." : "Connected"}
            </p>
          </div>
        </div>

        {/* Row counts */}
        <div className="border-2 border-foreground/10 bg-card p-4">
          <p className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">ROW COUNTS</p>
          <div className="grid grid-cols-3 gap-4">
            {(["agents", "memories", "relationships"] as const).map((key) => (
              <div key={key} className="border border-foreground/10 bg-background p-3">
                <p className="text-[11px] font-mono uppercase text-muted-foreground/50">{key}</p>
                <p className="text-lg font-mono font-bold text-foreground">{data?.counts[key] ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture flow */}
        <div className="border-2 border-foreground/10 bg-card p-4">
          <p className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
            DATA FLOW
          </p>
          <svg viewBox="0 0 580 60" className="w-full h-[60px]">
            <style>{`
              @keyframes flowDot { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
            `}</style>
            {FLOW_STEPS.map((s, i) => (
              <g key={s.label}>
                <rect x={s.x} y="15" width="90" height="30" fill="none" stroke={s.color} strokeWidth="1.5" />
                <text x={s.x + 45} y="34" textAnchor="middle" fill={s.color} fontSize="9" fontFamily="monospace">{s.label}</text>
                {i < FLOW_STEPS.length - 1 && (
                  <>
                    <line x1={s.x + 90} y1="30" x2={FLOW_STEPS[i + 1].x} y2="30" stroke="hsl(0 0% 30%)" strokeWidth="1" />
                    <circle cx={s.x + 105 + i * 15} cy="30" r="2.5" fill="#f97316" style={{ animation: `flowDot 2s ${i * 0.5}s ease-in-out infinite` }} />
                  </>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Env vars */}
        <div className="border-2 border-foreground/10 bg-card p-4">
          <p className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
            ENVIRONMENT VARIABLES
          </p>
          <div className="space-y-1.5">
            {(data?.envVars ?? []).map((v) => (
              <div key={v.key} className="flex items-center gap-3 border border-foreground/5 bg-background px-3 py-1.5">
                <StatusDot ok={v.set} />
                <span className="text-xs font-mono text-foreground">{v.key}</span>
                <span className={`ml-auto text-xs font-mono ${v.set ? "text-emerald-400" : "text-destructive"}`}>
                  {v.set ? "SET" : "MISSING"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
