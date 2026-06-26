"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

export default function StatCard({ label, value, sub, loading }: Props) {
  return (
    <div className="border-2 border-foreground/10 bg-card p-4">
      <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-2">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <>
          <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs font-mono text-muted-foreground/50 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}
