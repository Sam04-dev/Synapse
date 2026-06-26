import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load .env.local
const envFile = fs.readFileSync(path.join(root, ".env.local"), "utf8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const ca = fs.readFileSync(path.join(root, "global-bundle.pem"), "utf8");

async function query(sql, params) {
  const client = new pg.Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || "postgres",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD,
    ssl: { rejectUnauthorized: true, ca },
  });
  await client.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    await client.end();
  }
}

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "ap-southeast-2" })
);
const TABLE = process.env.DYNAMODB_TABLE_NAME || "SynapseEventLog";

async function logEvent(item) {
  await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
}

async function main() {
  console.log("=== Synapse Seed Script ===\n");

  // 1. Get first agent
  const agents = await query("SELECT id, name FROM agents ORDER BY created_at ASC LIMIT 1");
  if (agents.length === 0) {
    console.error("No agents found. Create one first via the UI.");
    process.exit(1);
  }
  const agent = agents[0];
  console.log(`Using agent: ${agent.name} (${agent.id})\n`);

  // 2. Create 4 memories
  const memories = [
    {
      id: crypto.randomUUID(),
      content: "User prefers concise responses under 200 words. Confirmed across 12 interactions in the onboarding flow.",
    },
    {
      id: crypto.randomUUID(),
      content: "Company billing cycle resets on the 1st of each month. Grace period is 7 days before suspension.",
    },
    {
      id: crypto.randomUUID(),
      content: "Primary contact for enterprise account is Sarah Chen (sarah@acme.corp). Timezone: PST, prefers async communication.",
    },
    {
      id: crypto.randomUUID(),
      content: "Compliance review completed 2026-06-15. SOC2 Type II audit passed. Next review scheduled for 2026-12-15.",
    },
  ];

  console.log("Creating 4 memories...");
  for (const m of memories) {
    await query(
      "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3)",
      [m.id, agent.id, m.content]
    );
    console.log(`  + ${m.id.slice(0, 8)}  "${m.content.slice(0, 50)}..."`);
  }

  // 3. Create 2 relationships
  const relationships = [
    {
      id: crypto.randomUUID(),
      source: memories[0].id,
      target: memories[2].id,
      type: "informs",
    },
    {
      id: crypto.randomUUID(),
      source: memories[1].id,
      target: memories[3].id,
      type: "triggers",
    },
  ];

  console.log("\nCreating 2 relationships...");
  for (const r of relationships) {
    await query(
      "INSERT INTO relationships (id, source_memory_id, target_memory_id, type) VALUES ($1, $2, $3, $4)",
      [r.id, r.source, r.target, r.type]
    );
    console.log(`  + ${r.source.slice(0, 8)} --[${r.type}]--> ${r.target.slice(0, 8)}`);
  }

  // 4. Log 10 events to DynamoDB
  const actions = [
    "memory.created", "memory.created", "memory.created", "memory.created",
    "relationship.created", "relationship.created",
    "agent.query", "agent.query", "agent.response", "agent.response",
  ];

  console.log("\nLogging 10 events to DynamoDB...");
  let dynamoOk = 0;
  let dynamoFail = 0;
  for (let i = 0; i < 10; i++) {
    const ts = new Date(Date.now() - (9 - i) * 60000).toISOString();
    const event = {
      PK: `AGENT#${agent.id}`,
      SK: `EVENT#${ts}#${crypto.randomUUID().slice(0, 8)}`,
      action: actions[i],
      timestamp: ts,
      payload: {
        agentId: agent.id,
        memoryId: i < 4 ? memories[i].id : memories[0].id,
        detail: `Seed event ${i + 1}: ${actions[i]}`,
      },
    };
    try {
      await logEvent(event);
      dynamoOk++;
      console.log(`  + ${actions[i].padEnd(22)} ${ts}`);
    } catch (err) {
      dynamoFail++;
      if (dynamoFail === 1) {
        console.warn(`  ! DynamoDB access denied (IAM policy missing dynamodb:PutItem). Skipping events.`);
      }
    }
  }
  if (dynamoFail > 0) {
    console.log(`  ${dynamoOk} events written, ${dynamoFail} skipped (IAM permissions).`);
  }

  console.log("\n=== Seed complete ===");
  console.log(`Agent ID: ${agent.id}`);
  console.log("Click on this agent in the UI to see the MemoryGraph.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
