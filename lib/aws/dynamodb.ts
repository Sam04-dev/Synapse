import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { AgentEvent } from "@/lib/types";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
      accessKeyId: (process.env.AWS_ACCESS_KEY_ID ?? "").trim(),
      secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY ?? "").trim(),
    },
  })
);

const TABLE = process.env.DYNAMODB_TABLE_NAME || "SynapseEventLog";

export async function logEvent(
  event: AgentEvent
): Promise<{ success: true } | { error: string; code: number }> {
  try {
    await client.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          PK: event.PK,
          SK: event.SK,
          action: event.action,
          payload: event.payload ?? {},
          timestamp: new Date().toISOString(),
        },
      })
    );
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "DynamoDB put failed";
    return { error: message, code: 500 };
  }
}

export async function queryEvents(
  agentId: string,
  limit = 50
): Promise<{ events: { action: string; payload: Record<string, unknown>; timestamp: string }[] } | { error: string; code: number }> {
  try {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `AGENT#${agentId}` },
        ScanIndexForward: false,
        Limit: limit,
      })
    );

    const events = (result.Items ?? []).map((item) => ({
      action: (item.action as string) ?? "",
      payload: (item.payload as Record<string, unknown>) ?? {},
      timestamp: (item.timestamp as string) ?? item.SK as string,
    }));

    return { events };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "DynamoDB query failed";
    return { error: message, code: 500 };
  }
}

export async function countRecentEvents(
  windowSecs = 10
): Promise<{ count: number } | { error: string; code: number }> {
  try {
    const cutoff = new Date(Date.now() - windowSecs * 1000).toISOString();
    let count = 0;
    let lastKey: Record<string, unknown> | undefined;
    do {
      const result = await client.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: "#ts > :cutoff",
          ExpressionAttributeNames: { "#ts": "timestamp" },
          ExpressionAttributeValues: { ":cutoff": cutoff },
          Select: "COUNT",
          ...(lastKey && { ExclusiveStartKey: lastKey }),
        })
      );
      count += result.Count ?? 0;
      lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);
    return { count };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "DynamoDB scan failed";
    return { error: message, code: 500 };
  }
}
