import fs from "fs";
import path from "path";
import crypto from "crypto";
import pg from "pg";

// ── Load .env.local ──────────────────────────────────────────────
const root = path.resolve(__dirname, "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const ca = fs.readFileSync(path.join(root, "global-bundle.pem"), "utf8");

// ── Postgres helper ──────────────────────────────────────────────
async function query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
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
    return (await client.query(sql, params)).rows;
  } finally {
    await client.end();
  }
}

// ── Main ─────────────────────────────────────────────────────────
const TARGET_AGENT = "agent-919d14ee";

const MEMORIES = [
  "User prefers email over phone support",
  "User had billing issue on 2024-01-15",
  "User upgraded to Pro plan",
  "User requested refund to original card",
] as const;

async function main() {
  console.log("=== Synapse Seed Script ===\n");

  // 1. Fetch agents and find target
  const agents = await query("SELECT id, name FROM agents ORDER BY created_at DESC");
  const agent = agents.find((a) => a.name === TARGET_AGENT);
  if (!agent) {
    console.error(`Agent "${TARGET_AGENT}" not found. Available: ${agents.map((a) => a.name).join(", ")}`);
    process.exit(1);
  }
  const agentId = agent.id as string;
  console.log(`Agent: ${agent.name} (${agentId})\n`);

  // 2. Clear previous seed data for this agent
  await query(
    "DELETE FROM relationships WHERE source_memory_id IN (SELECT id FROM memories WHERE agent_id = $1)",
    [agentId]
  );
  await query("DELETE FROM memories WHERE agent_id = $1", [agentId]);
  console.log("Cleared previous memories for this agent.\n");

  // 3. Create 4 memories
  const memoryIds: string[] = [];
  console.log("Creating 4 memories...");
  for (const content of MEMORIES) {
    const id = crypto.randomUUID();
    memoryIds.push(id);
    await query(
      "INSERT INTO memories (id, agent_id, content) VALUES ($1, $2, $3)",
      [id, agentId, content]
    );
    console.log(`  [+] ${id.slice(0, 8)}  "${content}"`);
  }

  // 4. Create 2 relationships
  const edges = [
    { src: 0, dst: 1, type: "related_to" },
    { src: 2, dst: 3, type: "led_to" },
  ];

  console.log("\nCreating 2 relationships...");
  for (const e of edges) {
    const id = crypto.randomUUID();
    await query(
      "INSERT INTO relationships (id, source_memory_id, target_memory_id, type) VALUES ($1, $2, $3, $4)",
      [id, memoryIds[e.src], memoryIds[e.dst], e.type]
    );
    console.log(`  [+] "${MEMORIES[e.src].slice(0, 30)}..." --[${e.type}]--> "${MEMORIES[e.dst].slice(0, 30)}..."`);
  }

  // 5. Log 10 events to PostgreSQL
  const actions = [
    "memory.created", "memory.created", "memory.created", "memory.created",
    "relationship.created", "relationship.created",
    "agent.query", "agent.response", "agent.query", "agent.response",
  ];

  await query("DELETE FROM events WHERE agent_id = $1", [agentId]);
  console.log("\nLogging 10 events to PostgreSQL...");
  for (let i = 0; i < 10; i++) {
    const ts = new Date(Date.now() - (9 - i) * 60_000).toISOString();
    const payload = {
      memoryId: i < 4 ? memoryIds[i] : memoryIds[0],
      detail: `Seed event ${i + 1}: ${actions[i]}`,
    };
    await query(
      "INSERT INTO events (id, agent_id, action, payload, created_at) VALUES ($1, $2, $3, $4, $5)",
      [crypto.randomUUID(), agentId, actions[i], JSON.stringify(payload), ts]
    );
    console.log(`  [+] ${actions[i].padEnd(22)} ${ts}`);
  }

  // 6. Verify
  const nodes = await query("SELECT id FROM memories WHERE agent_id = $1", [agentId]);
  const rels = await query(
    "SELECT r.id FROM relationships r JOIN memories m1 ON r.source_memory_id = m1.id WHERE m1.agent_id = $1",
    [agentId]
  );
  const evts = await query("SELECT id FROM events WHERE agent_id = $1", [agentId]);
  console.log(`\n=== Verification ===`);
  console.log(`Memories:      ${nodes.length} (expected 4)`);
  console.log(`Relationships: ${rels.length} (expected 2)`);
  console.log(`Events:        ${evts.length} (expected 10)`);
  console.log(`\nOpen http://localhost:3000 → click "${TARGET_AGENT}" to see the MemoryGraph + EventFeed.`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
