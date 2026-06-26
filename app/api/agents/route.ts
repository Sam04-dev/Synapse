import { createHash, randomBytes } from "crypto";
import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

export async function GET() {
  try {
    const result = await executeSql(
      "SELECT id, name, api_key_hash, created_at FROM agents ORDER BY created_at DESC"
    );
    if ("error" in result)
      return Response.json({ error: result.error, code: result.code }, { status: result.code });

    const agents = result.records.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      createdAt: String(r.created_at),
      apiKeyHash: (r.api_key_hash as string) ?? null,
    }));
    return Response.json({ agents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch agents";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: string };
    const id = crypto.randomUUID();
    const tenantId = "6ac20ecd-5f9e-44cf-b94f-41b9a219c82a";
    const name = body.name || `agent-${id.slice(0, 8)}`;
    const rawApiKey = `syn_${randomBytes(32).toString("hex")}`;
    const apiKeyHash = createHash("sha256").update(rawApiKey).digest("hex");

    const result = await executeSql(
      "INSERT INTO agents (id, tenant_id, name, framework, status, api_key_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, created_at",
      [id, tenantId, name, "OpenAI", "active", apiKeyHash]
    );
    if ("error" in result)
      return Response.json({ error: result.error, code: result.code }, { status: result.code });

    await logEvent({
      PK: `AGENT#${id}`,
      SK: `EVENT#${new Date().toISOString()}`,
      action: "agent_created",
      payload: { agentId: id, name },
    });

    const row = result.records[0];
    return Response.json({
      id: row.id as string,
      name: row.name as string,
      createdAt: String(row.created_at),
      apiKey: rawApiKey,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create agent";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
