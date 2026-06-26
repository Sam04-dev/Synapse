"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNodesState, useEdgesState, MarkerType, type Node } from "reactflow";
import GraphCanvas from "@/components/graph/GraphCanvas";
import GraphSkeleton from "@/components/graph/GraphSkeleton";
import type { NodeDetail } from "@/components/NodeDetailPanel";
import type { GraphData, GraphNode, GraphEdge } from "@/lib/types";

const COLUMN_X: Record<string, number> = { user: 0, memory: 380, action: 760, strategy: 1140 };
const COLUMN_ORDER: Record<string, number> = { user: 0, memory: 1, action: 2, strategy: 3 };
const ROW_HEIGHT = 220;

function edgeColor(label: string): string {
  if (/PREFER|CUSTOMER/i.test(label)) return "#3b82f6";
  if (/TRIGGER|SPIKE/i.test(label)) return "#f97316";
  if (/SUPPORT|INFORM/i.test(label)) return "#a855f7";
  if (/CLEAR|RESOLVE|CALCULAT/i.test(label)) return "#22c55e";
  if (/FLAG|HAS_TICKET|DETECT/i.test(label)) return "#ef4444";
  if (/ESCALAT|CAUSED/i.test(label)) return "#f59e0b";
  if (/GENERAT|UPGRAD/i.test(label)) return "#6366f1";
  if (/RESULT|SENT/i.test(label)) return "#06b6d4";
  return "#71717a";
}

function buildFlowNodes(graphNodes: GraphNode[], graphEdges: GraphEdge[], search: string, filter: string): Node[] {
  const edgeWeight = new Map<string, number>();
  for (const n of graphNodes) edgeWeight.set(n.id, 0);
  for (const e of graphEdges) {
    edgeWeight.set(e.source, (edgeWeight.get(e.source) ?? 0) + 1);
    edgeWeight.set(e.target, (edgeWeight.get(e.target) ?? 0) + 1);
  }
  const typed = graphNodes.map((n) => ({ ...n, nodeType: n.category ?? "memory" }));
  const buckets: Record<string, typeof typed> = { user: [], memory: [], action: [], strategy: [] };
  for (const n of typed) buckets[n.nodeType].push(n);
  for (const key of Object.keys(buckets)) {
    buckets[key].sort((a, b) => (edgeWeight.get(b.id) ?? 0) - (edgeWeight.get(a.id) ?? 0));
  }
  const totalHeight = Math.max(...Object.values(buckets).map((b) => b.length)) * ROW_HEIGHT;
  const positions = new Map<string, { x: number; y: number }>();
  for (const [type, nodes] of Object.entries(buckets)) {
    const colX = COLUMN_X[type];
    const columnHeight = nodes.length * ROW_HEIGHT;
    const offsetY = (totalHeight - columnHeight) / 2;
    nodes.forEach((n, i) => positions.set(n.id, { x: colX, y: offsetY + i * ROW_HEIGHT }));
  }
  const lowerSearch = search.toLowerCase();
  const hasSearch = lowerSearch.length > 0;
  const hasFilter = filter !== "all";
  return typed.map((n) => {
    const matchesSearch = !hasSearch || n.content.toLowerCase().includes(lowerSearch);
    const matchesFilter = !hasFilter || n.nodeType === filter;
    const highlighted = hasSearch && matchesSearch;
    const dimmed = (hasSearch && !matchesSearch) || (hasFilter && !matchesFilter);
    return {
      id: n.id,
      type: n.nodeType,
      position: positions.get(n.id) ?? { x: 0, y: 0 },
      data: { label: n.content, connections: edgeWeight.get(n.id) ?? 0, highlighted, dimmed },
      zIndex: highlighted ? 20 : 10,
    };
  });
}

function buildFlowEdges(graphEdges: GraphEdge[], flowNodes: Node[]) {
  const nodeTypeMap = new Map<string, string>();
  for (const n of flowNodes) nodeTypeMap.set(n.id, n.type ?? "memory");
  const nodeIdSet = new Set(flowNodes.map((n) => n.id));
  return graphEdges
    .filter((e) => {
      const valid = nodeIdSet.has(e.source) && nodeIdSet.has(e.target);
      if (!valid) console.warn(`[MemoryGraph] edge ${e.id} references unknown node`, e.source, e.target);
      return valid;
    })
    .map((e) => {
      const srcOrder = COLUMN_ORDER[nodeTypeMap.get(e.source) ?? "memory"] ?? 1;
      const tgtOrder = COLUMN_ORDER[nodeTypeMap.get(e.target) ?? "memory"] ?? 1;
      const source = srcOrder <= tgtOrder ? e.source : e.target;
      const target = srcOrder <= tgtOrder ? e.target : e.source;
      const label = (e.label ?? "").toUpperCase();
      const color = edgeColor(label);
      return {
        id: e.id, source, target, label,
        type: "smoothstep", animated: false,
        className: "synapse-edge",
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
        style: { stroke: color, strokeWidth: 1.5 },
        labelStyle: { fill: "#ffffff", fontSize: 10, fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "0.1em", fontWeight: 600 },
        labelBgStyle: { fill: "rgba(0,0,0,0.6)", fillOpacity: 1, rx: 4 },
        labelBgPadding: [5, 3] as [number, number],
      };
    });
}

interface Props { agentId: string }

export default function MemoryGraph({ agentId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [retryCount, setRetryCount] = useState(0);
  const rawDataRef = useRef<GraphData>({ nodes: [], edges: [] });
  const initialLoadDone = useRef(false);

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    const raw = rawDataRef.current;
    const gn = raw.nodes.find((n) => n.id === node.id);
    const connections = raw.edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => ({ id: e.id, label: e.label, target: e.source === node.id ? e.target : e.source }));
    setSelectedNode({
      id: node.id,
      content: gn?.content ?? String(node.data.label),
      type: (node.type as NodeDetail["type"]) ?? "memory",
      timestamp: gn?.timestamp,
      connections,
    });
  }, []);

  useEffect(() => {
    const d = rawDataRef.current;
    if (d.nodes.length === 0) return;
    const fn = buildFlowNodes(d.nodes, d.edges, search, filter);
    setNodes(fn);
    setEdges(buildFlowEdges(d.edges, fn));
  }, [search, filter, setNodes, setEdges]);

  useEffect(() => {
    initialLoadDone.current = false;
    rawDataRef.current = { nodes: [], edges: [] };
    setNodes([]); setEdges([]); setLoading(true); setEmpty(false);
    setError(null); setSelectedNode(null); setSearch(""); setFilter("all");
    const controller = new AbortController();

    async function fetchGraph() {
      try {
        const res = await fetch(`/api/memory?agentId=${agentId}`, { signal: controller.signal });
        if (!res.ok) {
          if (!initialLoadDone.current) { setError(`Failed to load (${res.status})`); setLoading(false); }
          return;
        }
        const data = (await res.json()) as GraphData;
        rawDataRef.current = data;
        const fn = buildFlowNodes(data.nodes, data.edges, "", "all");
        setNodes(fn);
        setEdges(buildFlowEdges(data.edges, fn));
        setEmpty(data.nodes.length === 0);
        if (!initialLoadDone.current) { setLoading(false); initialLoadDone.current = true; }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!initialLoadDone.current) { setError("Failed to load memory graph"); setLoading(false); }
      }
    }

    fetchGraph();
    const id = setInterval(fetchGraph, 3000);
    return () => { clearInterval(id); controller.abort(); };
  }, [agentId, setNodes, setEdges, retryCount]);

  const handleRetry = useCallback(() => setRetryCount((c) => c + 1), []);

  if (loading) return <GraphSkeleton />;
  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-sm font-mono text-destructive">{error}</p>
      <button
        onClick={handleRetry}
        className="border border-foreground/15 px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground hover:border-accent hover:text-accent"
      >
        RETRY
      </button>
    </div>
  );
  if (empty) return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-sm font-mono text-zinc-400">No memories yet</p>
      <p className="text-xs text-zinc-600 max-w-sm text-center">
        Create an agent and start the simulation to see the graph populate.
      </p>
    </div>
  );
  return (
    <GraphCanvas
      nodes={nodes} edges={edges}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      search={search} onSearchChange={setSearch}
      filter={filter} onFilterChange={setFilter}
      selectedNode={selectedNode} onCloseNode={() => setSelectedNode(null)}
      onRetry={handleRetry}
    />
  );
}
