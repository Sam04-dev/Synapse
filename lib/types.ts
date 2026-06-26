export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  createdAt: string;
  apiKeyHash: string;
}

export interface MemoryNode {
  id: string;
  agentId: string;
  content: string;
  createdAt: string;
}

export interface MemoryEdge {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  type: string;
}

export interface AgentEvent {
  PK: string;
  SK: string;
  action: string;
  payload: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  content: string;
  timestamp: string;
  type: "memory";
  category: "user" | "action" | "strategy" | "memory";
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}
