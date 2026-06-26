"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface StressResult {
  totalWrites: number;
  successful: number;
  failed: number;
  durationMs: number;
  writesPerSecond: number;
}

interface DemoState {
  simRunning: boolean;
  simCycles: number;
  startSim: () => void;
  stopSim: () => void;
  stressRunning: boolean;
  stressResult: StressResult | null;
  runStress: () => Promise<void>;
}

const DemoCtx = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [simRunning, setSimRunning] = useState(false);
  const [simCycles, setSimCycles] = useState(0);
  const [stressRunning, setStressRunning] = useState(false);
  const [stressResult, setStressResult] = useState<StressResult | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, []);

  const startSim = useCallback(() => {
    setSimRunning(true);
    simRef.current = setInterval(async () => {
      try { await fetch("/api/simulate", { method: "POST" }); } catch { /* silent */ }
      setSimCycles((c) => c + 1);
    }, 3000);
  }, []);

  const stopSim = useCallback(() => {
    if (simRef.current) clearInterval(simRef.current);
    simRef.current = null;
    setSimRunning(false);
  }, []);

  const runStress = useCallback(async () => {
    setStressRunning(true);
    setStressResult(null);
    try {
      const agentsRes = await fetch("/api/agents");
      const { agents } = await agentsRes.json() as { agents: { id: string }[] };
      if (!agents?.length) return;
      const res = await fetch("/api/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agents[0].id, writeCount: 100 }),
      });
      if (res.ok) setStressResult(await res.json());
    } finally {
      setStressRunning(false);
    }
  }, []);

  return (
    <DemoCtx.Provider value={{ simRunning, simCycles, startSim, stopSim, stressRunning, stressResult, runStress }}>
      {children}
    </DemoCtx.Provider>
  );
}

export function useDemoState(): DemoState {
  const ctx = useContext(DemoCtx);
  if (!ctx) throw new Error("useDemoState must be used within DemoStateProvider");
  return ctx;
}
