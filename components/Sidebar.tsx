"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, BarChart3, BookOpen, Network, Tag } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import type { MockUser } from "@/lib/mock-auth";

const MAIN_NAV = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/events", icon: Activity, label: "Event Stream" },
  { href: "/metrics", icon: BarChart3, label: "Metrics" },
  { href: "/docs", icon: BookOpen, label: "API Docs" },
  { href: "/architecture", icon: Network, label: "Architecture" },
  { href: "/pricing", icon: Tag, label: "Pricing" },
  { href: "/external-docs", icon: BookOpen, label: "Product Roadmap" },
] as const;

interface Props {
  user: MockUser;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav className="flex h-screen w-[220px] flex-col border-r-2 border-foreground/20 bg-card">
      {/* Synapse logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center border-2 border-foreground/25">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-accent">
            <polygon points="10,2 18,17 2,17" />
          </svg>
        </div>
        <span className="text-sm font-mono tracking-[0.2em] uppercase text-foreground font-bold">SYNAPSE</span>
        <span className="h-1.5 w-1.5 bg-accent" />
      </div>

      {/* Main nav */}
      <div className="flex-1 py-3 px-2 space-y-0.5">
        {MAIN_NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-[0.05em] transition-all duration-150 ${
                active
                  ? "bg-zinc-800 text-foreground border-l-2 border-l-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-800/50 border-l-2 border-l-transparent"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}

      </div>

      {/* Status + User at bottom */}
      <div className="border-t border-border">
        <div className="flex items-center gap-2 px-5 py-2">
          <div className="h-1.5 w-1.5 bg-accent animate-pulse-accent" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/60">SYSTEM ONLINE</span>
        </div>
        <div className="border-t border-border px-3 py-2">
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </nav>
  );
}
