"use client";

import { X } from "lucide-react";

export interface NodeDetail {
  id: string;
  content: string;
  type: "memory" | "user" | "action" | "strategy";
  timestamp?: string;
  connections: { id: string; label: string; target: string }[];
}

interface Props {
  node: NodeDetail | null;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, string> = {
  memory: "border-zinc-500/50 text-zinc-300 bg-zinc-500/10",
  user: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  action: "border-accent/50 text-accent bg-accent/10",
  strategy: "border-purple-500/50 text-purple-400 bg-purple-500/10",
};

export default function NodeDetailPanel({ node, onClose }: Props) {
  if (!node) return null;

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-72 border-l-2 border-foreground/20 bg-card shadow-xl animate-slide-in-right overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">
          NODE DETAIL
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <span className={`inline-block border px-2 py-0.5 text-[11px] font-mono tracking-[0.1em] uppercase mb-2 ${TYPE_STYLES[node.type]}`}>
            {node.type}
          </span>
          <p className="text-sm font-mono text-foreground leading-5">{node.content}</p>
        </div>

        <div>
          <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">ID</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{node.id}</p>
        </div>

        {node.timestamp && (
          <div>
            <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-1">CREATED</p>
            <p className="text-xs font-mono text-muted-foreground">
              {new Date(node.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {node.connections.length > 0 && (
          <div>
            <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-2">
              RELATIONSHIPS ({node.connections.length})
            </p>
            <div className="space-y-1.5">
              {node.connections.map((c) => (
                <div key={c.id} className="flex items-center gap-2 border border-foreground/10 bg-background px-2.5 py-1.5">
                  <span className="text-[10px] font-mono font-semibold text-accent">{c.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/50 truncate">{c.target.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
