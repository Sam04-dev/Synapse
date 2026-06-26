import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      agentId?: string;
      writeCount?: number;
    };

    const agentId = body.agentId;
    const writeCount = Math.min(body.writeCount ?? 50, 200);

    if (!agentId) {
      return Response.json(
        { error: "agentId is required", code: 400 },
        { status: 400 }
      );
    }

    const check = await executeSql(
      "SELECT id FROM agents WHERE id = $1 LIMIT 1",
      [agentId]
    );
    if ("error" in check)
      return Response.json({ error: check.error, code: 500 }, { status: 500 });
    if (check.records.length === 0)
      return Response.json({ error: "Agent not found", code: 404 }, { status: 404 });

    const start = Date.now();
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < writeCount; i++) {
      const action = i % 2 === 0 ? "STRESS_WRITE" : "STRESS_EVENT";
      const payload = { iteration: i, batchSize: writeCount };

      const [dsql, dynamo] = await Promise.all([
        executeSql(
          "INSERT INTO events (agent_id, action, payload) VALUES ($1::uuid, $2, $3::jsonb)",
          [agentId, action, JSON.stringify(payload)]
        ),
        logEvent({
          PK: `AGENT#${agentId}`,
          SK: `EVENT#${new Date().toISOString()}-${i}`,
          action,
          payload,
        }),
      ]);

      if (!("error" in dsql) && !("error" in dynamo)) successful++;
      else failed++;
    }

    const durationMs = Date.now() - start;

    return Response.json({
      success: true,
      totalWrites: writeCount,
      successful,
      failed,
      durationMs,
      writesPerSecond: +(successful / (durationMs / 1000)).toFixed(1),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stress test failed";
    return Response.json({ error: message, code: 500 }, { status: 500 });
  }
}
