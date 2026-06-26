"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  steps: string[];
  code: string;
  codeLabel: string;
}

export default function FlowCard({
  title,
  steps,
  code,
  codeLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-zinc-800/30"
      >
        {open ? (
          <ChevronDown size={14} className="text-accent shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-zinc-500 shrink-0" />
        )}
        <span className="text-sm font-mono font-semibold text-white">
          {title}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-[11px] font-mono text-zinc-300">
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <span className="text-accent text-xs">→</span>
                )}
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
              {codeLabel}
            </p>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-[11px] font-mono text-zinc-400 leading-relaxed overflow-x-auto">
              {code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
