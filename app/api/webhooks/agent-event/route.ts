import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

interface WebhookBody {
  agentId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  source?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as WebhookBody | null;
    if (!body || !body.agentId || !body.eventType) {
      return Response.json(
        { error: "agentId and eventType are required", code: 400 },
        { status: 400 }
      );
    }

    const { agentId, eventType, payload = {}, source = "unknown" } = body;

    const agentCheck = await executeSql(
      "SELECT id FROM agents WHERE id = $1 LIMIT 1",
      [agentId]
    );
    if ("error" in agentCheck)
      return Response.json({ error: agentCheck.error, code: 500 }, { status: 500 });
    if (agentCheck.records.length === 0)
      return Response.json({ error: `Agent ${agentId} not found`, code: 404 }, { status: 404 });

    const now = new Date().toISOString();
    const eventId = crypto.randomUUID();

    const dynResult = await logEvent({
      PK: `AGENT#${agentId}`,
      SK: `EVENT#${now}`,
      action: eventType,
      payload: { ...payload, source, eventId, receivedAt: now },
    });
    if ("error" in dynResult)
      return Response.json({ error: dynResult.error, code: dynResult.code }, { status: dynResult.code });

    await executeSql(
      "INSERT INTO events (id, agent_id, action, payload) VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)",
      [eventId, agentId, eventType, JSON.stringify({ ...payload, source })]
    );

    let storedIn: "dynamodb" | "dynamodb+dsql" = "dynamodb";

    if (eventType === "STATE_CHANGE" && typeof payload.memory === "string") {
      const memId = crypto.randomUUID();
      const memResult = await executeSql(
        "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3)",
        [memId, agentId, payload.memory]
      );
      if (!("error" in memResult)) storedIn = "dynamodb+dsql";
    }

    return Response.json({ success: true, eventId, storedIn });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return Response.json({ error: message, code: 500 }, { status: 500 });
  }
}
