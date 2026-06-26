export const ENDPOINTS = [
  {
    method: "POST", path: "/api/memory",
    description: "Write a memory node to an agent's namespace. Optionally link it to a parent memory.",
    request: `{\n  "agentId": "your-agent-uuid",\n  "memoryContent": "User prefers email support",\n  "relationshipType": "RELATED_TO",\n  "parentMemoryId": "parent-memory-uuid"\n}`,
    response: `{\n  "id": "new-memory-uuid",\n  "content": "User prefers email support",\n  "timestamp": "2026-06-24T10:30:00Z",\n  "type": "memory",\n  "relationshipId": "new-relationship-uuid"\n}`,
    curl: `curl -X POST http://localhost:3000/api/memory \\\n  --header "Content-Type: application/json" \\\n  --data '{"agentId": "your-agent-uuid", "memoryContent": "User prefers email support"}'`,
  },
  {
    method: "GET", path: "/api/memory",
    description: "Fetch all memory nodes and relationships for an agent. Returns graph-ready nodes and edges.",
    request: `GET /api/memory?agentId=your-agent-uuid`,
    response: `{\n  "nodes": [{"id": "uuid", "content": "...", "timestamp": "...", "type": "memory"}],\n  "edges": [{"id": "uuid", "source": "uuid", "target": "uuid", "label": "RELATED_TO"}]\n}`,
    curl: `curl http://localhost:3000/api/memory?agentId=your-agent-uuid`,
  },
  {
    method: "POST", path: "/api/events",
    description: "Log an agent action event to DynamoDB with single-table design partition keys.",
    request: `{\n  "PK": "AGENT#your-agent-uuid",\n  "SK": "EVENT#2026-06-24T10:30:00Z",\n  "action": "memory_created",\n  "payload": {"memoryId": "uuid"}\n}`,
    response: `{"success": true}`,
    curl: `curl -X POST http://localhost:3000/api/events \\\n  --header "Content-Type: application/json" \\\n  --data '{"PK": "AGENT#uuid", "SK": "EVENT#timestamp", "action": "memory_created", "payload": {}}'`,
  },
];

export const PYTHON_SDK = `# Install
pip install requests

import requests

BASE = "http://localhost:3000"
AGENT_ID = "your-agent-uuid"

# Write a memory
res = requests.post(f"{BASE}/api/memory", json={
    "agentId": AGENT_ID,
    "memoryContent": "Customer upgraded to Pro plan",
    "relationshipType": "LED_TO",
    "parentMemoryId": "previous-memory-uuid"
})
print(res.json())

# Fetch the memory graph
graph = requests.get(f"{BASE}/api/memory", params={"agentId": AGENT_ID})
print(f"Nodes: {len(graph.json()['nodes'])}, Edges: {len(graph.json()['edges'])}")

# Log an event
requests.post(f"{BASE}/api/events", json={
    "PK": f"AGENT#{AGENT_ID}",
    "SK": f"EVENT#2026-06-24T12:00:00Z",
    "action": "plan_upgrade",
    "payload": {"from": "free", "to": "pro"}
})`;
