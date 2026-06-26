"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePollingOptions<T> {
  url: string;
  intervalMs?: number;
  enabled?: boolean;
  transform?: (data: unknown) => T;
}

export function usePolling<T>({ url, intervalMs = 2000, enabled = true, transform }: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChanged, setLastChanged] = useState<Date | null>(null);
  const prevJsonRef = useRef<string>("");
  const visibleRef = useRef(true);

  useEffect(() => {
    function onVisChange() { visibleRef.current = document.visibilityState === "visible"; }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  const fetchData = useCallback(async () => {
    if (!visibleRef.current || !enabled) return;
    try {
      const res = await fetch(url);
      if (!res.ok) { setError(`HTTP ${res.status}`); return; }
      const raw = await res.json();
      const json = JSON.stringify(raw);
      if (json !== prevJsonRef.current) {
        prevJsonRef.current = json;
        setData(transform ? transform(raw) : raw as T);
        setLastChanged(new Date());
      }
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [url, enabled, transform]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, intervalMs]);

  return { data, loading, error, lastChanged, refetch: fetchData };
}
