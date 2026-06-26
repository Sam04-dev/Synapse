"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent } from "@/lib/types";

interface Props {
  onSelectAgent?: (id: string) => void;
  onCreateAgent?: () => void;
  refreshKey?: number;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1.5fr_auto_auto_auto] gap-0 border-b border-border px-0"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="px-4 py-3"><Skeleton className="h-3 w-24" /></div>
          <div className="px-4 py-3"><Skeleton className="h-3 w-44" /></div>
          <div className="px-4 py-3"><Skeleton className="h-3 w-16" /></div>
          <div className="px-4 py-3"><Skeleton className="h-3 w-28" /></div>
          <div className="px-4 py-3"><Skeleton className="h-3 w-6" /></div>
        </div>
      ))}
    </>
  );
}

export default function ApiKeyManager({ onSelectAgent, onCreateAgent, refreshKey }: Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    const res = await fetch("/api/agents");
    if (res.ok) {
      const data = (await res.json()) as { agents: Agent[] };
      setAgents(data.agents);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents, refreshKey]);

  async function handleDelete(id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setDeleting(id);
    setConfirmDelete(null);
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" });
      await fetchAgents();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// AGENT_NAMESPACES"}
        </span>
        <div className="flex-1 border-t border-border" />
        <button
          onClick={onCreateAgent}
          className="flex items-center gap-2 bg-foreground text-primary-foreground px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-[0.97]"
        >
          <Plus size={12} strokeWidth={2} />
          CREATE AGENT
        </button>
      </div>

      <div className="border-2 border-foreground/20">
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto] gap-0 border-b-2 border-foreground/20 bg-card">
          {["NAME", "ID", "CREATED", "KEY_HASH", ""].map((h, idx) => (
            <div key={idx} className="px-4 py-2.5 text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <SkeletonRows />
        ) : agents.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground col-span-5">
            NO AGENTS REGISTERED
          </div>
        ) : (
          agents.map((agent, i) => (
            <div
              key={agent.id}
              className="animate-row-enter grid grid-cols-[1fr_1.5fr_auto_auto_auto] gap-0 border-b border-border transition-all duration-150 hover:bg-accent/5 hover:border-l-2 hover:border-l-accent"
              style={{ "--row-index": i } as React.CSSProperties}
            >
              <div className="px-4 py-3 text-sm font-mono text-foreground cursor-pointer" onClick={() => onSelectAgent?.(agent.id)}>
                {agent.name}
              </div>
              <div className="px-4 py-3 text-sm font-mono text-muted-foreground cursor-pointer" onClick={() => onSelectAgent?.(agent.id)}>
                {agent.id}
              </div>
              <div className="px-4 py-3 text-sm font-mono text-muted-foreground cursor-pointer" onClick={() => onSelectAgent?.(agent.id)}>
                {new Date(agent.createdAt).toLocaleDateString()}
              </div>
              <div className="px-4 py-3 text-sm font-mono text-muted-foreground/40 cursor-pointer" onClick={() => onSelectAgent?.(agent.id)}>
                {agent.apiKeyHash?.slice(0, 16) ?? "N/A"}
              </div>
              <div className="px-4 py-3 flex items-center justify-end">
                {confirmDelete === agent.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(agent.id)}
                      disabled={deleting === agent.id}
                      className="text-[10px] font-mono tracking-[0.15em] uppercase text-red-400 border border-red-500/40 px-2 py-0.5 hover:bg-red-500/10 transition-colors"
                    >
                      {deleting === agent.id ? "..." : "CONFIRM"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-1.5 text-muted-foreground/40 hover:text-red-400 transition-colors"
                    title="Delete agent"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
