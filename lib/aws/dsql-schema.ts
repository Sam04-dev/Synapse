import { executeSql } from "./dsql";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    api_key_hash VARCHAR(255)
  )`,

  `ALTER TABLE agents ADD COLUMN IF NOT EXISTS tenant_id UUID`,
  `ALTER TABLE agents ADD COLUMN IF NOT EXISTS framework VARCHAR(100)`,
  `ALTER TABLE agents ADD COLUMN IF NOT EXISTS status VARCHAR(50)`,
  `ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_key_hash VARCHAR(255)`,

  `CREATE TABLE IF NOT EXISTS memories (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL REFERENCES agents(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS relationships (
    id VARCHAR(36) PRIMARY KEY,
    source_memory_id VARCHAR(36) NOT NULL REFERENCES memories(id),
    target_memory_id VARCHAR(36) NOT NULL REFERENCES memories(id),
    type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_memories_agent_id ON memories(agent_id)`,

  `CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_events_agent_id ON events(agent_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
];

export async function runMigrations(): Promise<
  { success: true } | { error: string; statement: string }
> {
  for (const sql of SCHEMA_STATEMENTS) {
    const result = await executeSql(sql);
    if ("error" in result) {
      return { error: result.error, statement: sql.split("\n")[0] };
    }
  }
  return { success: true };
}
