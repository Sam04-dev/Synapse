"use client";

import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  bullets: string[];
  borderColor: string;
  iconColor: string;
}

export default function ArchBox({
  icon: Icon,
  title,
  bullets,
  borderColor,
  iconColor,
}: Props) {
  return (
    <div
      className={`relative border-2 ${borderColor} bg-zinc-900/60 backdrop-blur-sm rounded-xl px-5 py-4 w-[210px] shrink-0`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700`}>
          <Icon size={16} className={iconColor} />
        </div>
        <h3 className="text-sm font-mono font-bold text-white tracking-wide">
          {title}
        </h3>
      </div>
      <ul className="space-y-1">
        {bullets.map((b) => (
          <li
            key={b}
            className="text-[10px] font-mono text-zinc-500 leading-relaxed flex items-start gap-1.5"
          >
            <span className="text-zinc-600 mt-[3px]">›</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
