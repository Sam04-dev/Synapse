import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

const ACTIONS = [
  "MEMORY_CREATED",
  "AUDIT_LOG",
  "PROCESS_TICKET",
  "STATE_CHANGE",
  "COMPLIANCE_FLAG",
  "INCIDENT_TRIGGER",
  "PROMOTION_SENT",
] as const;

const PAYLOADS: Record<string, () => Record<string, unknown>> = {
  MEMORY_CREATED: () => ({
    content: "Agent context updated",
    source: "auto",
    latencyMs: 12 + Math.floor(Math.random() * 30),
  }),
  AUDIT_LOG: () => ({
    action: "record_accessed",
    userId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    result: "ok",
  }),
  PROCESS_TICKET: () => ({
    ticketId: `TKT-${Math.floor(5000 + Math.random() * 5000)}`,
    status: Math.random() > 0.5 ? "resolved" : "in_progress",
    priority: Math.random() > 0.7 ? "high" : "normal",
  }),
  STATE_CHANGE: () => ({
    field: "agent_status",
    from: "idle",
    to: "processing",
    trigger: "incoming_request",
  }),
  COMPLIANCE_FLAG: () => ({
    ruleId: `CR-${Math.floor(100 + Math.random() * 900)}`,
    severity: Math.random() > 0.6 ? "high" : "medium",
    entity: `ENT-${Math.floor(1000 + Math.random() * 9000)}`,
  }),
  INCIDENT_TRIGGER: () => ({
    service: "api-gateway",
    metric: "error_rate",
    value: +(1 + Math.random() * 4).toFixed(1),
    threshold: 1.0,
  }),
  PROMOTION_SENT: () => ({
    userId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    channel: Math.random() > 0.5 ? "email" : "push",
    campaign: `C-${Math.floor(100 + Math.random() * 900)}`,
  }),
};

export async function runSimulationCycle(
  agentIds: string[]
): Promise<{ eventsInserted: number }> {
  let inserted = 0;
  const eventsPerAgent = 8;

  for (const agentId of agentIds) {
    for (let i = 0; i < eventsPerAgent; i++) {
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const payload = (PAYLOADS[action] ?? PAYLOADS.MEMORY_CREATED)();
      const result = await executeSql(
        `INSERT INTO events (agent_id, action, payload)
         VALUES ($1::uuid, $2, $3::jsonb)`,
        [agentId, action, JSON.stringify(payload)]
      );
      if (!("error" in result)) inserted++;

      await logEvent({
        PK: `AGENT#${agentId}`,
        SK: `EVENT#${new Date().toISOString()}`,
        action,
        payload,
      });
    }
  }

  return { eventsInserted: inserted };
}
