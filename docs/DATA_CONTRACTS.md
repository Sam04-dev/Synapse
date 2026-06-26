# DATA_CONTRACTS.md - Data Structures for Project Synapse

## API Request Format (POST /api/memory)
```json
{
  "agentId": "string",
  "memoryContent": "string",
  "relationshipType": "string | null",
  "parentMemoryId": "string | null"
}
```

## API Response Format (GET /api/memory)
```json
{
  "nodes": [
    {
      "id": "string",
      "content": "string",
      "timestamp": "ISO8601 string",
      "type": "memory"
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "label": "string"
    }
  ]
}
```

## Core Data Models (TypeScript)
```typescript
// Maps to Aurora DSQL 'Agents' table
export interface Agent {
  id: string; // UUID
  name: string;
  createdAt: string; // ISO Date
  apiKeyHash: string;
}

// Maps to Aurora DSQL 'Memories' table (Relational)
export interface MemoryNode {
  id: string; // UUID
  agentId: string; // FK
  content: string;
  createdAt: string;
}

// Maps to Aurora DSQL 'Relationships' table
export interface MemoryEdge {
  id: string;
  sourceMemoryId: string; // FK
  targetMemoryId: string; // FK
  type: string;
}

// Maps to DynamoDB 'EventLog' (Single-Table Design)
export interface AgentEvent {
  PK: string; // AGENT#<agentId>
  SK: string; // EVENT#<timestamp>
  action: string;
  payload: Record<string, any>;
}
```
