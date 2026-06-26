"use client";

import { useState, useEffect } from "react";
import { Brain, Plus, Code, Activity } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const STEPS = [
  { num: "1", icon: Plus, title: "CREATE AGENT", desc: "Name your agent namespace" },
  { num: "2", icon: Code, title: "INTEGRATE", desc: "Use the API key in your code" },
  { num: "3", icon: Activity, title: "WATCH", desc: "See memories form in real-time" },
] as const;

export default function WelcomeOverlay({ onComplete }: Props) {
  const [loadingOpacity, setLoadingOpacity] = useState(1);
  const [welcomeOpacity, setWelcomeOpacity] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Fade out loading
    timers.push(setTimeout(() => setLoadingOpacity(0), 50));

    // Unmount loading, mount welcome at opacity 0
    timers.push(setTimeout(() => {
      setShowLoading(false);
      setShowWelcome(true);
    }, 450));

    // Fade in welcome
    timers.push(setTimeout(() => setWelcomeOpacity(1), 500));

    // Fade out welcome
    timers.push(setTimeout(() => setWelcomeOpacity(0), 3400));

    // Complete
    timers.push(setTimeout(() => onComplete(), 3800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {showLoading && (
        <div
          className="flex flex-col items-center"
          style={{ opacity: loadingOpacity, transition: "opacity 400ms ease-out" }}
        >
          <div className="mb-10 flex items-baseline gap-1">
            <span className="text-2xl font-mono tracking-[0.3em] uppercase text-foreground font-bold">
              SYNAPSE
            </span>
            <span className="h-2 w-2 bg-accent" />
          </div>
          <div className="w-64">
            <div className="h-[2px] w-full bg-accent" />
            <div className="mt-3 flex justify-between">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                AUTHENTICATING
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">100%</span>
            </div>
          </div>
        </div>
      )}

      {showWelcome && (
        <div
          className="flex flex-col items-center"
          style={{ opacity: welcomeOpacity, transition: "opacity 400ms ease-in-out" }}
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center border border-zinc-700 bg-zinc-900/50">
            <Brain className="text-accent" size={48} />
          </div>

          <h2 className="text-2xl font-bold tracking-widest text-white font-mono uppercase">
            WELCOME TO SYNAPSE
          </h2>

          <p className="mt-4 text-sm text-zinc-400 text-center max-w-md leading-relaxed">
            Stateful memory engine for autonomous AI agents.
            Create your first agent to begin.
          </p>

          <div className="mt-10 flex gap-4 max-w-lg w-full">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center bg-orange-500/20 text-orange-400 rounded text-xs font-bold">
                    {step.num}
                  </span>
                  <step.icon size={16} className="text-zinc-500" />
                </div>
                <p className="text-xs font-mono font-bold text-white tracking-wide mb-1">
                  {step.title}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="absolute bottom-6 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/40">
        v0.1.0 — MEMORY ENGINE
      </p>
    </div>
  );
}
