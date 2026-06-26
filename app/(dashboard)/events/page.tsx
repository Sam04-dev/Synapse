"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Activity, Pause, Play } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { timeAgo, actionColor } from "@/lib/event-utils";
import type { Agent } from "@/lib/types";

interface EventItem {
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

const PER_PAGE = 20;
const POLL_MS = 2000;

const FILTER_CHIPS = [
  "ALL", "AUDIT_LOG", "MEMORY_CREATED",
  "PROCESS_TICKET", "ERROR_OCCURRED", "STATE_CHANGE",
];

export default function EventsPage() {
  const user = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);
  const prevKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.isDemoUser) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/agents");
        if (!res.ok) return;
        const data = (await res.json()) as { agents: Agent[] };
        setAgents(data.agents);
        if (data.agents.length > 0) setSelectedAgentId(data.agents[0].id);
      } finally { setLoading(false); }
    })();
  }, [user?.isDemoUser]);

  const fetchEvents = useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      const res = await fetch(`/api/events?agentId=${selectedAgentId}`);
      if (!res.ok) return;
      const d = (await res.json()) as { events: EventItem[] };
      const fetched = d.events ?? [];

      const currentKeys = new Set(fetched.map((e) => `${e.action}-${e.timestamp}`));
      const fresh = new Set<string>();
      Array.from(currentKeys).forEach((k) => {
        if (!prevKeysRef.current.has(k)) fresh.add(k);
      });
      prevKeysRef.current = currentKeys;

      if (fresh.size > 0) {
        setNewKeys(fresh);
        setTimeout(() => setNewKeys(new Set()), 3000);
      }

      setEvents(fetched);
    } catch { /* silent */ }
  }, [selectedAgentId]);

  useEffect(() => {
    prevKeysRef.current = new Set();
    setEvents([]);
    setExpandedRows(new Set());
    setActiveFilter("ALL");
    setPage(0);
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (paused || !selectedAgentId) return;
    const id = setInterval(fetchEvents, POLL_MS);
    return () => clearInterval(id);
  }, [paused, selectedAgentId, fetchEvents]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => activeFilter === "ALL" ? events : events.filter((e) => e.action === activeFilter), [events, activeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const eventsLastMinute = useMemo(() => events.filter((e) => Date.now() - new Date(e.timestamp).getTime() < 60000).length, [events]);
  useEffect(() => { setPage(0); }, [activeFilter]);

  if (!loading && agents.length === 0) return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Activity size={48} className="text-zinc-700" />
      <h2 className="text-lg text-zinc-400">No events yet</h2>
      <p className="text-sm text-zinc-600">Events will appear here once you create an agent and start logging actions</p>
      <a href="/" className="flex items-center gap-2 bg-foreground text-primary-foreground px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground">+ Create Agent</a>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-4 bg-card px-5 py-3 border-b-2 border-foreground/20">
        <h1 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground">Event Stream</h1>
        <div className="flex items-center gap-2 ml-2">
          <div className={`h-2 w-2 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
          <span className={`text-xs font-mono tracking-[0.15em] uppercase ${paused ? "text-amber-500" : "text-emerald-500"}`}>{paused ? "PAUSED" : loading ? "CONNECTING" : "LIVE"}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/50 border border-foreground/10 px-2 py-0.5">
          {eventsLastMinute} evt/min
        </span>
        <div className="flex-1" />
        {loading ? (
          <div className="h-[30px] w-48 bg-zinc-800 animate-pulse rounded-none" />
        ) : (
          <select value={selectedAgentId ?? ""} onChange={(e) => { setSelectedAgentId(e.target.value); setExpandedRows(new Set()); setActiveFilter("ALL"); }}
            className="bg-secondary border border-foreground/15 px-3 py-1.5 text-xs font-mono text-foreground appearance-none cursor-pointer focus:border-accent focus:outline-none">
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <button disabled={loading} onClick={() => setPaused((p) => !p)} className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-mono uppercase transition-all disabled:opacity-40 ${paused ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" : "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"}`}>
          {paused ? <Play size={12} /> : <Pause size={12} />} {paused ? "RESUME" : "PAUSE"}
        </button>
      </div>

      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border overflow-x-auto bg-card/50">
        {FILTER_CHIPS.map((type) => (
          <button key={type} onClick={() => setActiveFilter(type)}
            className={`shrink-0 px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase border ${activeFilter === type ? "border-accent bg-accent/15 text-accent" : "border-foreground/10 text-muted-foreground hover:border-foreground/25 hover:text-foreground"}`}>
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 grid grid-cols-[90px_180px_1fr] border-b-2 border-foreground/20 bg-card z-10">
          {["TIME", "ACTION", "PAYLOAD"].map((h) => <div key={h} className="px-5 py-2.5 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60">{h}</div>)}
        </div>
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-[90px_180px_1fr] border-b border-border opacity-40 animate-pulse">
              <div className="px-5 py-3"><div className="h-3 w-10 bg-zinc-700 rounded-sm" /></div>
              <div className="px-5 py-3"><div className="h-5 w-32 bg-zinc-700 rounded-sm" /></div>
              <div className="px-5 py-3"><div className="h-3 bg-zinc-700 rounded-sm" style={{ width: `${40 + (i % 3) * 15}%` }} /></div>
            </div>
          ))
        ) : paged.length === 0 ? (
          <div className="px-5 py-12 text-center text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
            {activeFilter === "ALL" ? "NO EVENTS RECORDED" : `NO ${activeFilter.replace(/_/g, " ")} EVENTS`}
          </div>
        ) : paged.map((ev, i) => {
          const gi = page * PER_PAGE + i;
          const expanded = expandedRows.has(gi);
          const ps = JSON.stringify(ev.payload, null, 2);
          const pp = JSON.stringify(ev.payload);
          const isLong = pp.length > 60;
          const evKey = `${ev.action}-${ev.timestamp}`;
          const isNew = newKeys.has(evKey);
          return (
            <div key={`${ev.timestamp}-${gi}`}
              className={`border-b border-border hover:bg-accent/5 ${isNew ? "animate-event-enter" : ""}`}
              style={{ borderLeft: isNew ? "3px solid hsl(20 90% 50%)" : "3px solid transparent" }}>
              <div className="grid grid-cols-[90px_180px_1fr] cursor-pointer"
                onClick={() => { if (isLong) setExpandedRows((prev) => { const s = new Set(prev); if (s.has(gi)) s.delete(gi); else s.add(gi); return s; }); }}>
                <div className="px-5 py-3 font-mono text-xs text-muted-foreground">{timeAgo(ev.timestamp)}</div>
                <div className="px-5 py-3">
                  <span className={`inline-block border px-2 py-0.5 text-[11px] font-mono tracking-[0.08em] uppercase ${actionColor(ev.action)}`}>{ev.action.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 font-mono text-xs text-foreground/50 min-w-0">
                  {isLong && <span className="shrink-0 text-muted-foreground">{expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>}
                  {!expanded && <span className="truncate">{isLong ? pp.slice(0, 70) + "…" : pp}</span>}
                </div>
              </div>
              {expanded && <div className="border-t border-border bg-background px-5 py-3"><pre className="font-mono text-xs leading-5 text-foreground/70 whitespace-pre-wrap">{ps}</pre></div>}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t-2 border-foreground/20 bg-card px-5 py-2.5">
          <span className="text-xs font-mono text-muted-foreground">{filtered.length} events — page {page + 1}/{totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="flex items-center gap-1 border border-foreground/15 px-2.5 py-1 text-xs font-mono uppercase text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-30"><ChevronLeft size={12} /> PREV</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="flex items-center gap-1 border border-foreground/15 px-2.5 py-1 text-xs font-mono uppercase text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-30">NEXT <ChevronRight size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
