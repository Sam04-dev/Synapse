"use client";

import { Component, type ErrorInfo, type ReactNode, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { MemoryNode, UserNode, ActionNode, StrategyNode } from "./CustomNodes";
import { MiniMapNode, MINI_COLORS } from "./MiniMapNode";
import GraphLegend from "@/components/GraphLegend";
import GraphToolbar from "./GraphToolbar";
import NodeDetailPanel, { type NodeDetail } from "@/components/NodeDetailPanel";

const nodeTypes = { memory: MemoryNode, user: UserNode, action: ActionNode, strategy: StrategyNode };


interface BoundaryState { hasError: boolean }

class GraphErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, BoundaryState> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError(): BoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[MemoryGraph] render error:", error, info); }
  render() {
    if (this.state.hasError) return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm font-mono text-destructive">
          Graph visualization unavailable. Check console for details.
        </p>
        <button
          onClick={() => { this.setState({ hasError: false }); this.props.onRetry(); }}
          className="border border-foreground/15 px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground hover:border-accent hover:text-accent"
        >
          RETRY
        </button>
      </div>
    );
    return this.props.children;
  }
}

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (_: unknown, node: Node) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  selectedNode: NodeDetail | null;
  onCloseNode: () => void;
  onRetry: () => void;
}

export default function GraphCanvas({
  nodes, edges, onNodesChange, onEdgesChange, onNodeClick,
  search, onSearchChange, filter, onFilterChange,
  selectedNode, onCloseNode, onRetry,
}: Props) {
  const miniMapColor = useCallback((node: Node) => MINI_COLORS[node.type ?? "memory"] ?? "#71717a", []);
  return (
    <GraphErrorBoundary onRetry={onRetry}>
      <div
        className="absolute inset-0 memory-graph-wrapper"
        style={{ background: "radial-gradient(ellipse at center, hsl(0 0% 10%) 0%, hsl(0 0% 6%) 70%)" }}
      >
        <GraphToolbar search={search} onSearchChange={onSearchChange} activeFilter={filter} onFilterChange={onFilterChange} />
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent", paddingTop: 40 }}
        >
          <Background color="hsl(0 0% 18%)" gap={24} size={1} />
          <Controls
            position="top-left"
            className="!top-12 [&>button]:border-2 [&>button]:border-foreground/30 [&>button]:bg-zinc-800 [&>button]:text-foreground [&>button]:rounded-none [&>button:hover]:bg-accent [&>button:hover]:text-accent-foreground [&>button>svg]:fill-foreground"
          />
          <MiniMap
            nodeColor={miniMapColor}
            nodeComponent={MiniMapNode}
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 20%)", width: 150, height: 100 }}
            position="bottom-right"
          />
        </ReactFlow>
        <GraphLegend />
        <NodeDetailPanel node={selectedNode} onClose={onCloseNode} />
      </div>
    </GraphErrorBoundary>
  );
}
