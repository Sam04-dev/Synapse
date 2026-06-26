"use client";

import { Brain, Plus, Code2, Activity } from "lucide-react";

interface Props {
  onCreateAgent: () => void;
  onLoadDemo: () => void;
  loadingDemo: boolean;
}

export default function EmptyState({ onCreateAgent, onLoadDemo, loadingDemo }: Props) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center max-w-md px-6">
        {/* Brain icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-foreground/20 bg-card">
          <Brain size={28} className="text-accent" />
        </div>

        <h1 className="mb-2 text-lg font-mono tracking-[0.2em] uppercase text-foreground">
          Welcome to Synapse
        </h1>
        <p className="mb-8 text-center text-xs font-mono leading-5 text-muted-foreground">
          Stateful memory engine for autonomous AI agents.
          Create your first agent to begin.
        </p>

        {/* 3-step flow */}
        <div className="mb-8 flex w-full gap-4">
          {[
            { icon: Plus, label: "Create Agent", desc: "Name your agent namespace" },
            { icon: Code2, label: "Integrate", desc: "Use the API key in your code" },
            { icon: Activity, label: "Watch", desc: "See memories form in real-time" },
          ].map((step, i) => (
            <div key={step.label} className="flex-1 border-2 border-foreground/10 bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center bg-accent/10 text-[11px] font-mono font-bold text-accent">
                  {i + 1}
                </span>
                <step.icon size={12} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-mono font-semibold text-foreground uppercase tracking-wide">
                {step.label}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground leading-4 mt-1">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCreateAgent}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-xs font-mono tracking-[0.15em] uppercase transition-all hover:bg-accent/90 active:scale-[0.97]"
          >
            <Plus size={12} strokeWidth={2} />
            CREATE YOUR FIRST AGENT
          </button>
          <button
            onClick={onLoadDemo}
            disabled={loadingDemo}
            className="flex items-center gap-2 border-2 border-foreground/20 px-4 py-2.5 text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {loadingDemo ? "LOADING..." : "LOAD DEMO DATA"}
          </button>
        </div>
      </div>
    </div>
  );
}
