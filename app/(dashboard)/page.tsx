"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import ApiKeyManager from "@/components/ApiKeyManager";
import EmptyState from "@/components/EmptyState";
import CreateAgentModal from "@/components/CreateAgentModal";
const MemoryGraph = dynamic(() => import("@/components/MemoryGraph"), { ssr: false });
import EventFeed from "@/components/EventFeed";
import { useAuth } from "@/lib/mock-auth";
import type { Agent } from "@/lib/types";

export default function DashboardPage() {
  const user = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!user?.isDemoUser) {
      setAgents([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = (await res.json()) as { agents: Agent[] };
        setAgents(data.agents);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.isDemoUser]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  async function handleLoadDemo() {
    setLoadingDemo(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        await fetchAgents();
      }
    } finally {
      setLoadingDemo(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-2 w-2 bg-accent animate-pulse-accent" />
      </div>
    );
  }

  if (agents.length === 0 && !selectedAgentId) {
    return (
      <>
        <EmptyState
          onCreateAgent={() => setModalOpen(true)}
          onLoadDemo={handleLoadDemo}
          loadingDemo={loadingDemo}
        />
        <CreateAgentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={fetchAgents}
        />
      </>
    );
  }

  if (!selectedAgentId) {
    return (
      <>
        <div className="h-full overflow-y-auto">
          <ApiKeyManager
            onSelectAgent={setSelectedAgentId}
            onCreateAgent={() => setModalOpen(true)}
            refreshKey={refreshKey}
          />
        </div>
        <CreateAgentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={() => { fetchAgents(); setRefreshKey((k) => k + 1); }}
        />
      </>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-3 border-b-2 border-foreground/20 bg-card px-5 py-3">
        <button
          onClick={() => setSelectedAgentId(null)}
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft size={14} strokeWidth={2} />
        </button>
        <div className="h-4 w-px bg-border" />
        <span className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">
          AGENT:
        </span>
        <span className="font-mono text-xs text-foreground/60">
          {selectedAgentId}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-accent animate-pulse-accent" />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent">ACTIVE</span>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <MemoryGraph agentId={selectedAgentId} />
      </div>
      <EventFeed agentId={selectedAgentId} />
    </div>
  );
}
