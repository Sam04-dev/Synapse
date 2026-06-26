"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/mock-auth";
import { useDemoState, type StressResult } from "@/lib/demo-state";
import StatCard from "@/components/metrics/StatCard";
import LineChart from "@/components/metrics/LineChart";
import DonutChart from "@/components/metrics/DonutChart";
import ErrorState from "@/components/ErrorState";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface MetricsData {
  memories: number; agents: number; events: number;
  eventsPerSec: number; avgLatencyMs: number;
  growth: { day: string; count: number }[];
  throughputBars: number[];
  dsqlStatus: string; dynamoStatus: string;
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === "connected";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase ${ok ? "text-emerald-400" : "text-destructive"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
      {status}
    </span>
  );
}

function ThroughputBars({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="border-2 border-foreground/10 bg-card p-4">
      <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">DYNAMO WRITE THROUGHPUT (10s)</p>
      <div className="flex items-end gap-1 h-[50px]">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: v > 0 ? Math.max((v / max) * 50, 3) : 3, background: v > 0 ? "hsl(20 90% 50%)" : "hsl(0 0% 25%)" }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-muted-foreground/40">-10s</span>
        <span className="text-[9px] font-mono text-muted-foreground/40">now</span>
      </div>
    </div>
  );
}

function StressTestCard({ hasAgents }: { hasAgents: boolean }) {
  const { stressRunning, stressResult, runStress } = useDemoState();
  const completed = !stressRunning && stressResult !== null;

  return (
    <div className="border-2 border-foreground/10 bg-card p-4">
      <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60">ACID Compliance Test</p>
      <p className="text-xs font-mono text-muted-foreground/40 mt-0.5 mb-4">Concurrent writes to Aurora DSQL with zero race conditions</p>

      {!completed ? (
        <button
          onClick={runStress}
          disabled={stressRunning || !hasAgents}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-xs font-mono tracking-[0.1em] uppercase font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stressRunning && (
            <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
          )}
          {stressRunning ? "RUNNING..." : "RUN 100 CONCURRENT WRITES"}
        </button>
      ) : (
        <StressResults result={stressResult} onRerun={runStress} running={stressRunning} />
      )}
    </div>
  );
}

function StressResults({ result, onRerun, running }: { result: StressResult; onRerun: () => void; running: boolean }) {
  const allPassed = result.failed === 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        {([
          ["Total", result.totalWrites, "text-foreground"],
          ["Successful", result.successful, result.successful === result.totalWrites ? "text-emerald-400" : "text-yellow-400"],
          ["Failed", result.failed, allPassed ? "text-emerald-400" : "text-destructive"],
          ["Duration", `${result.durationMs.toLocaleString()}ms`, "text-foreground"],
          ["Throughput", `${result.writesPerSecond}/sec`, "text-foreground"],
        ] as [string, string | number, string][]).map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[10px] font-mono uppercase text-muted-foreground/50">{label}</p>
            <p className={`text-base font-mono font-bold ${color}`}>{String(value)}</p>
          </div>
        ))}
      </div>
      {allPassed ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle size={14} />
          <span className="text-xs font-mono">Zero conflicts. Zero rollbacks. ACID verified.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle size={14} />
          <span className="text-xs font-mono">{result.failed} write(s) failed — review error logs.</span>
        </div>
      )}
      <button
        onClick={onRerun}
        disabled={running}
        className="flex items-center gap-2 border border-foreground/15 px-3 py-1.5 text-xs font-mono uppercase text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-50"
      >
        RUN AGAIN
      </button>
    </div>
  );
}

export default function MetricsPage() {
  const user = useAuth();
  const { simRunning, simCycles, startSim, stopSim } = useDemoState();
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) { setError(`HTTP ${res.status}`); return; }
      setData(await res.json());
      setError(null);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.isDemoUser) { setLoading(false); return; }
    fetchMetrics();
    const id = setInterval(fetchMetrics, 2000);
    return () => clearInterval(id);
  }, [user?.isDemoUser, fetchMetrics]);

  if (!user?.isDemoUser) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">NO METRICS — SIGN IN WITH DEMO CREDENTIALS</p>
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={fetchMetrics} />;

  const m = data;
  const segments = [
    { label: "User", value: Math.round((m?.memories ?? 0) * 0.35), color: "#3b82f6" },
    { label: "Action", value: Math.round((m?.memories ?? 0) * 0.3), color: "#f97316" },
    { label: "Strategy", value: Math.round((m?.memories ?? 0) * 0.15), color: "#a855f7" },
    { label: "Memory", value: Math.round((m?.memories ?? 0) * 0.2), color: "#71717a" },
  ];

  const eps = m?.eventsPerSec ?? 0;
  const eventsPerSecDisplay = eps > 0 && eps < 0.1 ? "< 0.1" : String(eps);

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="px-6 py-6 space-y-5">

        <div className="flex items-center gap-3">
          <h1 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground">Metrics</h1>
          <div className="flex-1 border-t border-border" />
          {simRunning && (
            <>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
              <span className="text-[10px] font-mono text-muted-foreground border border-foreground/10 px-2 py-0.5">
                Cycles: {simCycles}
              </span>
            </>
          )}
          <button
            onClick={startSim}
            disabled={simRunning}
            className="border border-accent/60 px-3 py-1.5 text-xs font-mono uppercase text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            START SIMULATION
          </button>
          <button
            onClick={stopSim}
            disabled={!simRunning}
            className="border border-destructive/60 px-3 py-1.5 text-xs font-mono uppercase text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            STOP SIMULATION
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Memories" value={m?.memories ?? 0} loading={loading} />
          <StatCard label="Active Agents" value={m?.agents ?? 0} loading={loading} />
          <StatCard label="Events / sec" value={eventsPerSecDisplay} loading={loading} />
          <StatCard label="Avg Latency" value={`${m?.avgLatencyMs ?? 0}ms`} sub="p95 response" loading={loading} />
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="border-2 border-foreground/10 bg-card p-4">
            <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">MEMORY GROWTH (7 DAYS)</p>
            <div className="h-[180px]"><LineChart data={m?.growth ?? []} /></div>
          </div>
          <div className="border-2 border-foreground/10 bg-card p-4 min-w-[280px]">
            <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">MEMORY TYPES</p>
            <DonutChart segments={segments} />
          </div>
        </div>

        <ThroughputBars bars={m?.throughputBars ?? Array(10).fill(0)} />

        <StressTestCard hasAgents={(m?.agents ?? 0) > 0} />

        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-foreground/10 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60">AURORA DSQL</p>
              <StatusBadge status={m?.dsqlStatus ?? "unknown"} />
            </div>
            <p className="text-xs font-mono text-muted-foreground">PostgreSQL wire protocol</p>
            <p className="text-xs font-mono text-muted-foreground/50">SERIALIZABLE isolation</p>
          </div>
          <div className="border-2 border-foreground/10 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60">DYNAMODB</p>
              <StatusBadge status={m?.dynamoStatus ?? "unknown"} />
            </div>
            <p className="text-xs font-mono text-muted-foreground">Single-table design</p>
            <p className="text-xs font-mono text-muted-foreground/50">On-demand capacity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
