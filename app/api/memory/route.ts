import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";

function classifyMemory(content: string): "user" | "action" | "strategy" | "memory" {
  const lower = content.toLowerCase();
  if (/user|customer|profile|vip|prefer|sentiment|feedback|engagement/i.test(lower)) return "user";
  if (/strateg|plan|policy|classif|launch|discount|compliance|rule/i.test(lower)) return "strategy";
  if (/action|closed|processed|sent|ticket|escalat|handoff|tier\s?\d/i.test(lower)) return "action";
  return "memory";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return Response.json({ error: "agentId required", code: 400 }, { status: 400 });
  }

  const since = searchParams.get("since");

  const nodesResult = since
    ? await executeSql(
        "SELECT id, content, created_at FROM memories WHERE agent_id = $1 AND created_at > $2 ORDER BY created_at ASC",
        [agentId, since]
      )
    : await executeSql(
        "SELECT id, content, created_at FROM memories WHERE agent_id = $1 ORDER BY created_at ASC",
        [agentId]
      );

  if ("error" in nodesResult) {
    return Response.json({ error: nodesResult.error, code: nodesResult.code }, { status: nodesResult.code });
  }

  let edgesResult;

  if (since && nodesResult.records.length > 0) {
    const newIds = nodesResult.records.map((r) => r.id as string);
    const srcPlaceholders = newIds.map((_, i) => `$${i + 2}`).join(", ");
    const tgtPlaceholders = newIds.map((_, i) => `$${i + 2 + newIds.length}`).join(", ");
    edgesResult = await executeSql(
      `SELECT id, source_memory_id, target_memory_id, type FROM relationships
       WHERE source_memory_id IN (SELECT id FROM memories WHERE agent_id = $1)
       AND (source_memory_id IN (${srcPlaceholders}) OR target_memory_id IN (${tgtPlaceholders}))`,
      [agentId, ...newIds, ...newIds]
    );
  } else if (since && nodesResult.records.length === 0) {
    return Response.json({ nodes: [], edges: [] });
  } else {
    edgesResult = await executeSql(
      "SELECT id, source_memory_id, target_memory_id, type FROM relationships WHERE source_memory_id IN (SELECT id FROM memories WHERE agent_id = $1) OR target_memory_id IN (SELECT id FROM memories WHERE agent_id = $1)",
      [agentId]
    );
  }

  if ("error" in edgesResult) {
    return Response.json({ error: edgesResult.error, code: edgesResult.code }, { status: edgesResult.code });
  }

  return Response.json({
    nodes: nodesResult.records.map((r) => {
      const content = r.content as string;
      return {
        id: r.id as string,
        content,
        timestamp: new Date(r.created_at as string).toISOString(),
        type: "memory" as const,
        category: classifyMemory(content),
      };
    }),
    edges: edgesResult.records.map((r) => ({
      id: r.id as string,
      source: r.source_memory_id as string,
      target: r.target_memory_id as string,
      label: r.type as string,
    })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return Response.json({ error: "Invalid JSON body", code: 400 }, { status: 400 });
  }

  const { agentId, memoryContent, relationshipType, parentMemoryId } = body as {
    agentId?: string;
    memoryContent?: string;
    relationshipType?: string;
    parentMemoryId?: string;
  };

  if (!agentId || !memoryContent) {
    return Response.json(
      { error: "agentId and memoryContent are required", code: 400 },
      { status: 400 }
    );
  }

  const memoryId = crypto.randomUUID();

  const memoryResult = await executeSql(
    "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at",
    [memoryId, agentId, memoryContent]
  );

  if ("error" in memoryResult) {
    return Response.json({ error: memoryResult.error, code: memoryResult.code }, { status: memoryResult.code });
  }

  let relationshipId: string | null = null;
  if (relationshipType && parentMemoryId) {
    relationshipId = crypto.randomUUID();
    const relResult = await executeSql(
      "INSERT INTO relationships (id, source_memory_id, target_memory_id, type) VALUES ($1, $2, $3, $4)",
      [relationshipId, parentMemoryId, memoryId, relationshipType]
    );

    if ("error" in relResult) {
      return Response.json({ error: relResult.error, code: relResult.code }, { status: relResult.code });
    }
  }

  await logEvent({
    PK: `AGENT#${agentId}`,
    SK: `EVENT#${new Date().toISOString()}`,
    action: "memory_created",
    payload: {
      memoryId,
      agentId,
      contentPreview: memoryContent.slice(0, 100),
      relationshipType: relationshipType ?? null,
      parentMemoryId: parentMemoryId ?? null,
      relationshipId,
    },
  });

  const row = memoryResult.records[0];
  return Response.json({
    id: row.id as string,
    content: row.content as string,
    timestamp: String(row.created_at),
    type: "memory",
    relationshipId,
  });
}
