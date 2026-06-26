"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/event-utils";

interface EventItem {
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface Props {
  agentId: string;
}

const FILTER_CHIPS = ["ALL", "AUDIT_LOG", "MEMORY_CREATED", "PROCESS_TICKET", "STATE_CHANGE", "ERROR_OCCURRED"];

function SkeletonLines() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-3 py-0.5" style={{ animationDelay: `${i * 60}ms` }}>
          <Skeleton className="h-3.5 w-16 shrink-0" />
          <Skeleton className="h-3.5 w-28 shrink-0" />
          <Skeleton className="h-3.5 flex-1" />
        </div>
      ))}
    </>
  );
}

export default function EventFeed({ agentId }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);
  const pausedRef = useRef(false);
  const prevKeysRef = useRef<Set<string>>(new Set());
  const visibleRef = useRef(true);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    function onVis() { visibleRef.current = document.visibilityState === "visible"; }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    prevKeysRef.current = new Set();

    async function fetchEvents() {
      if (pausedRef.current || !visibleRef.current) return;
      try {
        const res = await fetch(`/api/events?agentId=${agentId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? `HTTP ${res.status}`);
          setEvents([]);
        } else {
          const fetched: EventItem[] = data.events ?? [];
          const currentKeys = new Set(fetched.map((e) => `${e.action}-${e.timestamp}`));
          if (prevKeysRef.current.size > 0) {
            const fresh = new Set<string>();
            currentKeys.forEach((k) => { if (!prevKeysRef.current.has(k)) fresh.add(k); });
            if (fresh.size > 0) {
              setNewKeys(fresh);
              setTimeout(() => setNewKeys(new Set()), 4000);
            }
          }
          prevKeysRef.current = currentKeys;
          setEvents(fetched);
          setError(null);
        }
        setLoading(false);
      } catch {
        if (!cancelled) setError("Failed to fetch events");
        setLoading(false);
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [agentId]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function formatPayload(payload: Record<string, unknown>): string {
    const s = JSON.stringify(payload);
    return s === "{}" ? "" : s.length > 80 ? s.slice(0, 80) + "…" : s;
  }

  const filtered = useMemo(
    () => activeFilter === "ALL" ? events : events.filter((e) => e.action === activeFilter),
    [events, activeFilter]
  );

  const eventsLastMinute = useMemo(
    () => events.filter((e) => Date.now() - new Date(e.timestamp).getTime() < 60000).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, Math.floor(Date.now() / 1000)]
  );

  return (
    <div className="flex flex-col border-t-2 border-foreground/20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-card px-4 py-2">
        <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">{"// EVENT_LOG"}</span>
        <span className="text-[10px] font-mono text-muted-foreground/50 border border-foreground/10 px-2 py-0.5">
          {loading ? "—" : `${eventsLastMinute} evt/min`}
        </span>
        <div className="flex-1" />
        {paused && (
          <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 uppercase">PAUSED</span>
        )}
        <button
          onClick={() => setPaused((p) => !p)}
          className={`text-[10px] font-mono tracking-[0.08em] uppercase border px-2 py-0.5 transition-colors ${
            paused
              ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          }`}
        >
          {paused ? "RESUME STREAM" : "PAUSE STREAM"}
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 bg-card/60 px-4 py-1.5 border-t border-foreground/5 overflow-x-auto">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`shrink-0 px-2 py-0.5 text-[9px] font-mono tracking-[0.08em] uppercase border transition-colors ${
              activeFilter === chip
                ? "border-accent bg-accent text-accent-foreground"
                : "border-foreground/10 text-muted-foreground/60 hover:border-foreground/25 hover:text-muted-foreground"
            }`}
          >
            {chip.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="h-[155px] overflow-y-auto bg-background px-4 py-2 font-mono text-sm leading-6">
        {loading ? (
          <SkeletonLines />
        ) : error ? (
          <p className="text-destructive text-xs tracking-[0.1em] uppercase">ERR: {error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">NO EVENTS YET</p>
        ) : (
          filtered.map((ev, i) => {
            const key = `${ev.action}-${ev.timestamp}`;
            const isNew = newKeys.has(key);
            const rel = timeAgo(ev.timestamp);
            const isJustNow = rel === "just now";
            return (
              <div
                key={`${ev.timestamp}-${i}`}
                className={`flex gap-3 transition-colors duration-150 hover:text-foreground ${
                  isNew ? "border-l-2 border-orange-500 pl-2 bg-orange-500/5 animate-event-enter text-foreground/80" : "text-foreground/60"
                }`}
              >
                <span className={`shrink-0 ${isJustNow ? "text-green-400" : "text-muted-foreground"}`}>
                  [{rel}]
                </span>
                <span className="shrink-0 text-accent font-semibold">{ev.action}</span>
                <span className="truncate text-muted-foreground">{formatPayload(ev.payload)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
