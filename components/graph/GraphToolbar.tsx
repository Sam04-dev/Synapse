"use client";

import { Search } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All", color: "border-zinc-600 text-zinc-300" },
  { key: "user", label: "User", color: "border-blue-500 text-blue-400" },
  { key: "strategy", label: "Strategy", color: "border-purple-500 text-purple-400" },
  { key: "action", label: "Action", color: "border-orange-500 text-orange-400" },
  { key: "memory", label: "Other", color: "border-zinc-500 text-zinc-400" },
] as const;

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: string;
  onFilterChange: (v: string) => void;
}

export default function GraphToolbar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 bg-card/90 backdrop-blur-sm border-b border-foreground/10 px-4 py-2">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search memories..."
          className="w-48 bg-zinc-900/80 border border-foreground/10 pl-8 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="h-4 w-px bg-foreground/10" />

      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`border px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase ${
            activeFilter === f.key
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-foreground/10 text-muted-foreground/50 hover:text-muted-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
