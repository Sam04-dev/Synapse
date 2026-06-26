import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

const MEMORY_TEMPLATES = [
  "User #{id} prefers email communication over chat",
  "Strategy: Escalate billing disputes over $500 to human agent",
  "Action: Closed ticket #{ticket} — refund processed",
  "User #{id} has been a customer since 2023, premium tier",
  "Memory: Last interaction with User #{id} was hostile, use de-escalation protocol",
  "Strategy: For VIP customers, skip IVR and route directly to senior agent",
  "Action: Generated summary report for shift handoff",
  "Memory: System outage on 6/20 affected 200 users — root cause: DB pool exhaustion",
  "User #{id} requested feature X, logged as FR-{ticket}",
  "Strategy: Compliance check required before processing GDPR deletion requests",
  "Action: Audited {n} transactions for PCI compliance",
  "Memory: User #{id} has 3 open tickets, avoid sending survey",
];

const REL_TYPES = ["relates_to", "caused", "supersedes", "references", "derived_from"];

const EVENT_ACTIONS = [
  "MEMORY_CREATED", "AUDIT_LOG", "PROCESS_TICKET",
  "STATE_CHANGE", "ERROR_OCCURRED",
] as const;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function fillTemplate(tpl: string): string {
  return tpl
    .replace(/\{id\}/g, String(randomInt(1000, 9999)))
    .replace(/\{ticket\}/g, String(randomInt(5000, 9999)))
    .replace(/\{n\}/g, String(randomInt(20, 200)));
}

function randomPayload(action: string): Record<string, unknown> {
  switch (action) {
    case "MEMORY_CREATED":
      return { source: "simulation", latencyMs: randomInt(8, 45) };
    case "AUDIT_LOG":
      return { action: "record_accessed", userId: `USR-${randomInt(1000, 9999)}`, result: "ok" };
    case "PROCESS_TICKET":
      return { ticketId: `TKT-${randomInt(5000, 9999)}`, status: Math.random() > 0.5 ? "resolved" : "in_progress" };
    case "STATE_CHANGE":
      return { field: "agent_status", from: "idle", to: "processing" };
    case "ERROR_OCCURRED":
      return { code: "TIMEOUT", service: "dsql", retryable: true, durationMs: randomInt(3000, 10000) };
    default:
      return {};
  }
}

export async function POST() {
  try {
    const agentsResult = await executeSql(
      "SELECT id FROM agents ORDER BY RANDOM() LIMIT 1"
    );
    if ("error" in agentsResult)
      return Response.json({ error: agentsResult.error, code: 500 }, { status: 500 });
    if (agentsResult.records.length === 0)
      return Response.json({ error: "No agents found. Seed data first.", code: 404 }, { status: 404 });

    const agentId = agentsResult.records[0].id as string;

    // 1. Create 5 memories
    const memoryIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const tpl = MEMORY_TEMPLATES[randomInt(0, MEMORY_TEMPLATES.length - 1)];
      const content = fillTemplate(tpl);
      const id = crypto.randomUUID();
      const result = await executeSql(
        "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3)",
        [id, agentId, content]
      );
      if ("error" in result)
        return Response.json({ error: result.error, code: 500 }, { status: 500 });
      memoryIds.push(id);
    }

    // 2. Fetch existing memory IDs for this agent to create cross-references
    const existingResult = await executeSql(
      "SELECT id FROM memories WHERE agent_id = $1 ORDER BY RANDOM() LIMIT 10",
      [agentId]
    );
    const allIds = !("error" in existingResult)
      ? (existingResult.records.map((r) => r.id as string))
      : memoryIds;

    // 3. Create 2-3 relationships
    const relCount = randomInt(2, 3);
    let relsCreated = 0;
    for (let i = 0; i < relCount; i++) {
      const src = memoryIds[i % memoryIds.length];
      const candidates = allIds.filter((id) => id !== src);
      if (candidates.length === 0) continue;
      const tgt = candidates[randomInt(0, candidates.length - 1)];
      const type = REL_TYPES[randomInt(0, REL_TYPES.length - 1)];
      const result = await executeSql(
        "INSERT INTO relationships (id, source_memory_id, target_memory_id, type) VALUES ($1, $2, $3, $4)",
        [crypto.randomUUID(), src, tgt, type]
      );
      if (!("error" in result)) relsCreated++;
    }

    // 4. Write 8-10 events to DynamoDB + DSQL events table
    const eventCount = randomInt(8, 10);
    let eventsWritten = 0;
    for (let i = 0; i < eventCount; i++) {
      const action = EVENT_ACTIONS[randomInt(0, EVENT_ACTIONS.length - 1)];
      const payload = randomPayload(action);
      const ts = new Date().toISOString();

      await executeSql(
        "INSERT INTO events (agent_id, action, payload) VALUES ($1::uuid, $2, $3::jsonb)",
        [agentId, action, JSON.stringify(payload)]
      );

      const dynResult = await logEvent({
        PK: `AGENT#${agentId}`,
        SK: `EVENT#${ts}`,
        action,
        payload,
      });
      if (!("error" in dynResult)) eventsWritten++;
    }

    return Response.json({
      success: true,
      agentId,
      memoriesCreated: memoryIds.length,
      relationshipsCreated: relsCreated,
      eventsWritten,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Simulation failed";
    return Response.json({ error: message, code: 500 }, { status: 500 });
  }
}
