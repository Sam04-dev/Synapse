import { createHash, randomBytes } from "crypto";
import { executeSql } from "@/lib/aws/dsql";
import { logEvent } from "@/lib/aws/dynamodb";
import { runSimulationCycle } from "@/lib/simulate";
import { buildAgents } from "@/lib/seed-agents";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "ap-southeast-2" })
);
const DYNAMO_TABLE = process.env.DYNAMODB_TABLE_NAME || "SynapseEventLog";

function staggeredTimestamp(maxDaysAgo: number = 7): string {
  return new Date(
    Date.now() - Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000
  ).toISOString();
}

function makeApiKeyHash(): string {
  const rawApiKey = `syn_${randomBytes(32).toString("hex")}`;
  return createHash("sha256").update(rawApiKey).digest("hex");
}

async function deleteAllDsqlData(): Promise<void> {
  await executeSql("TRUNCATE TABLE events, relationships, memories, agents CASCADE");
}

async function deleteAllDynamoData(): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;
  do {
    const scan = await dynamoClient.send(
      new ScanCommand({
        TableName: DYNAMO_TABLE,
        ProjectionExpression: "PK, SK",
        ExclusiveStartKey: lastKey,
      })
    );
    for (const item of scan.Items ?? []) {
      await dynamoClient.send(
        new DeleteCommand({ TableName: DYNAMO_TABLE, Key: { PK: item.PK, SK: item.SK } })
      );
    }
    lastKey = scan.LastEvaluatedKey;
  } while (lastKey);
}

export interface SeedResult {
  success: true;
  agents_created: number;
  memories_created: number;
  edges_created: number;
  events_created: number;
  simulated_events: number;
}

export async function seedRealData(): Promise<SeedResult | { error: string }> {
  await deleteAllDsqlData();
  await deleteAllDynamoData();

  const agents = buildAgents();
  let totalMemories = 0;
  let totalEdges = 0;
  let totalEvents = 0;

  for (const agent of agents) {
    const tenantId = "6ac20ecd-5f9e-44cf-b94f-41b9a219c82a";
    const agentResult = await executeSql(
      "INSERT INTO agents (id, tenant_id, name, framework, status, api_key_hash) VALUES ($1, $2, $3, $4, $5, $6)",
      [agent.id, tenantId, agent.name, "LangChain", "active", makeApiKeyHash()]
    );
    if ("error" in agentResult) return { error: agentResult.error };

    const memoryIds: string[] = [];
    for (const content of agent.memories) {
      const memId = crypto.randomUUID();
      memoryIds.push(memId);
      const result = await executeSql(
        "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3)",
        [memId, agent.id, content]
      );
      if ("error" in result) return { error: result.error };
    }
    totalMemories += memoryIds.length;

    for (const [srcIdx, tgtIdx, type] of agent.relationships) {
      const result = await executeSql(
        "INSERT INTO relationships (id, source_memory_id, target_memory_id, type) VALUES ($1, $2, $3, $4)",
        [crypto.randomUUID(), memoryIds[srcIdx], memoryIds[tgtIdx], type]
      );
      if ("error" in result) return { error: result.error };
      totalEdges++;
    }

    for (const ev of agent.events) {
      await logEvent({
        PK: `AGENT#${agent.id}`,
        SK: `EVENT#${staggeredTimestamp()}`,
        action: ev.action,
        payload: ev.payload,
      });
      totalEvents++;
    }
  }

  const sim = await runSimulationCycle(agents.map((a) => a.id));

  return {
    success: true,
    agents_created: agents.length,
    memories_created: totalMemories,
    edges_created: totalEdges,
    events_created: totalEvents,
    simulated_events: sim.eventsInserted,
  };
}
