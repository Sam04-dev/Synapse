"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import type { MockUser } from "@/lib/mock-auth";

interface Props {
  user: MockUser;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-2 py-1.5 transition-colors hover:bg-secondary"
      >
        <div className="flex h-7 w-7 items-center justify-center bg-accent text-[11px] font-mono font-bold text-accent-foreground tracking-wide">
          {user.avatarInitials}
        </div>
        <ChevronDown size={10} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1 z-50 w-48 border-2 border-foreground/20 bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs font-mono text-foreground truncate">{user.name}</p>
            <p className="text-[11px] font-mono text-muted-foreground truncate">{user.email}</p>
            <span className="mt-1 inline-block border border-accent/50 bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono tracking-[0.15em] uppercase text-accent">
              {user.plan}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-mono tracking-[0.1em] uppercase text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={12} />
            SIGN OUT
          </button>
        </div>
      )}
    </div>
  );
}
