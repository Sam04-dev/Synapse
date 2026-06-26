"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";

interface NodeProps {
  data: { label: string; connections?: number; highlighted?: boolean; dimmed?: boolean };
  selected: boolean;
}

const HANDLE = { width: 6, height: 6, border: "none" };

function sizeScale(connections: number): number {
  return Math.min(1 + connections * 0.05, 1.3);
}

export const MemoryNode = memo(({ data, selected }: NodeProps) => {
  const s = sizeScale(data.connections ?? 0);
  return (
    <div
      className={`border-2 px-4 py-3 font-mono text-[11px] leading-[1.5] ${
        selected ? "border-accent bg-zinc-800" : "border-zinc-500 bg-zinc-900"
      }`}
      style={{
        color: "hsl(43 23% 88%)",
        width: 200 * s,
        position: "relative",
        zIndex: 10,
        opacity: data.dimmed ? 0.25 : 1,
        boxShadow: data.highlighted ? "0 0 16px 2px rgba(249,115,22,0.5)" : selected ? "0 0 12px 1px rgba(249,115,22,0.3)" : "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ ...HANDLE, background: "#f97316" }} />
      {data.label}
      <Handle type="source" position={Position.Right} style={{ ...HANDLE, background: "#f97316" }} />
    </div>
  );
});
MemoryNode.displayName = "MemoryNode";

export const UserNode = memo(({ data, selected }: NodeProps) => {
  const s = sizeScale(data.connections ?? 0);
  const size = 180 * s;
  return (
    <div
      className={`flex items-center justify-center border-2 rounded-full p-4 font-mono text-[11px] leading-[1.5] text-center ${
        selected ? "border-blue-400 bg-blue-950" : "border-blue-500 bg-blue-950/60"
      }`}
      style={{
        color: "hsl(210 90% 80%)",
        width: size,
        height: size,
        position: "relative",
        zIndex: 10,
        opacity: data.dimmed ? 0.25 : 1,
        boxShadow: data.highlighted ? "0 0 20px 3px rgba(59,130,246,0.5)" : selected ? "0 0 14px 2px rgba(59,130,246,0.3)" : "0 2px 10px rgba(0,0,0,0.4)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ ...HANDLE, background: "#3b82f6" }} />
      <span className="px-2">{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ ...HANDLE, background: "#3b82f6" }} />
    </div>
  );
});
UserNode.displayName = "UserNode";

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const s = sizeScale(data.connections ?? 0);
  const size = 130 * s;
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        position: "relative",
        zIndex: 10,
        opacity: data.dimmed ? 0.25 : 1,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ ...HANDLE, background: "#f97316" }} />
      <div
        className={`absolute inset-[10px] border-2 ${
          selected ? "border-accent bg-orange-950" : "border-orange-500 bg-orange-950/50"
        }`}
        style={{
          transform: "rotate(45deg)",
          boxShadow: data.highlighted ? "0 0 18px 2px rgba(249,115,22,0.5)" : selected ? "0 0 12px 1px rgba(249,115,22,0.3)" : "0 2px 8px rgba(0,0,0,0.4)",
        }}
      />
      <span
        className="relative z-10 font-mono text-[10px] leading-[1.4] text-center px-4 max-w-[100px]"
        style={{ color: "hsl(20 90% 80%)" }}
      >
        {data.label}
      </span>
      <Handle type="source" position={Position.Right} style={{ ...HANDLE, background: "#f97316" }} />
    </div>
  );
});
ActionNode.displayName = "ActionNode";

export const StrategyNode = memo(({ data, selected }: NodeProps) => {
  const s = sizeScale(data.connections ?? 0);
  return (
    <div
      className={`flex items-center justify-center border-0 px-6 py-4 font-mono text-[11px] leading-[1.5] text-center ${
        selected ? "bg-purple-900" : "bg-purple-950/80"
      }`}
      style={{
        color: "hsl(270 80% 85%)",
        width: 200 * s,
        minHeight: 100 * s,
        position: "relative",
        zIndex: 10,
        opacity: data.dimmed ? 0.25 : 1,
        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        outline: selected ? "2px solid #c084fc" : "2px solid #a855f7",
        outlineOffset: "-2px",
        boxShadow: data.highlighted ? "0 0 20px 3px rgba(168,85,247,0.5)" : "0 2px 10px rgba(0,0,0,0.4)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ ...HANDLE, background: "#a855f7" }} />
      <span className="px-2">{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ ...HANDLE, background: "#a855f7" }} />
    </div>
  );
});
StrategyNode.displayName = "StrategyNode";
