import { Pool } from "pg";
import fs from "fs";
import path from "path";

interface QuerySuccess {
  records: Record<string, unknown>[];
}

interface QueryError {
  error: string;
  code: number;
}

export type QueryResult = QuerySuccess | QueryError;

const caBundlePath = path.join(process.cwd(), "global-bundle.pem");
let ca: string | undefined;
try {
  ca = fs.readFileSync(caBundlePath, "utf8");
} catch {
  // CA bundle not available
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const host = process.env.POSTGRES_HOST!;
  const port = Number(process.env.POSTGRES_PORT) || 5432;
  const database = process.env.POSTGRES_DB || "postgres";
  const user = process.env.POSTGRES_USER || "postgres";
  const password = process.env.POSTGRES_PASSWORD!;

  pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 600000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  // Warm up one connection eagerly so first request doesn't pay cold-start cost.
  pool.connect().then((client) => client.release()).catch(() => {});

  return pool;
}

export async function executeSql(
  sql: string,
  params?: unknown[]
): Promise<QueryResult> {
  try {
    const p = getPool();
    const result = await p.query(sql, params);
    return { records: result.rows as Record<string, unknown>[] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "DSQL query failed";
    return { error: message, code: 500 };
  }
}
