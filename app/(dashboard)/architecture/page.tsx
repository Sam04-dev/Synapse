"use client";

import dynamic from "next/dynamic";
import FlowCard from "@/components/architecture/FlowCard";

const MermaidDiagram = dynamic(
  () => import("@/components/architecture/MermaidDiagram"),
  { ssr: false, loading: () => <DiagramSkeleton /> }
);

function DiagramSkeleton() {
  return (
    <div className="w-full h-[520px] bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-[11px] font-mono text-zinc-600 tracking-widest uppercase">Rendering diagram…</p>
    </div>
  );
}

// ─── Mermaid source ───────────────────────────────────────────────────────────
const DIAGRAM = `
flowchart TB

  subgraph BROWSER["  Browser — Client Components  "]
    direction LR
    LC["LoginScreen"]
    MG["MemoryGraph"]
    EF["EventFeed"]
    MP["MetricsPage"]
    AM["AgentManager"]
    DP["DebugPage"]
    SC["Sim Controls"]
  end

  subgraph VERCEL["  Vercel — Next.js API Routes  "]
    direction TB

    subgraph AUTH_GRP["Auth"]
      R_LOGIN["POST /api/auth/login"]
      R_SESSION["GET  /api/auth/session"]
      R_LOGOUT["POST /api/auth/logout"]
    end

    subgraph AGENT_GRP["Agents"]
      R_AG["GET    /api/agents"]
      R_AP["POST   /api/agents"]
      R_AD["DELETE /api/agents/:id"]
    end

    subgraph MEM_GRP["Memory"]
      R_MG["GET  /api/memory"]
      R_MP["POST /api/memory"]
    end

    subgraph EVT_GRP["Events"]
      R_EG["GET  /api/events"]
      R_EP["POST /api/events"]
    end

    subgraph SYS_GRP["System"]
      R_MET["GET  /api/metrics"]
      R_SIM["POST /api/simulate"]
      R_STR["POST /api/stress-test"]
      R_DBG["GET  /api/debug"]
      R_SET["POST /api/setup"]
    end
  end

  subgraph DSQL["  Aurora DSQL — Distributed SQL · SERIALIZABLE isolation  "]
    direction LR
    T_AG[("agents")]
    T_MEM[("memories")]
    T_REL[("relationships")]
    T_EVT[("events")]
    T_USR[("users")]
  end

  subgraph DDB["  DynamoDB — SynapseEventLog  "]
    T_LOG[("PK: AGENT#id · SK: EVENT#ts")]
  end

  %% ── Browser → API ──────────────────────────────────────
  LC --> R_LOGIN & R_SESSION & R_LOGOUT
  MG --> R_MG & R_MP
  EF --> R_EG
  MP --> R_MET & R_STR
  SC --> R_SIM
  AM --> R_AG & R_AP & R_AD
  DP --> R_DBG

  %% ── Auth → DSQL ────────────────────────────────────────
  R_LOGIN --> T_USR
  R_SESSION --> T_USR

  %% ── Agent routes → DSQL ────────────────────────────────
  R_AG & R_AP & R_AD --> T_AG

  %% ── Memory routes → DSQL ───────────────────────────────
  R_MG --> T_MEM & T_REL
  R_MP --> T_MEM & T_REL

  %% ── Event routes → DynamoDB ────────────────────────────
  R_EG & R_EP --> T_LOG

  %% ── Metrics → DSQL + DynamoDB (parallel read) ──────────
  R_MET --> T_AG & T_MEM & T_EVT & T_LOG

  %% ── Simulate → DSQL + DynamoDB (dual-write) ────────────
  R_SIM --> T_MEM & T_REL & T_EVT & T_LOG

  %% ── Stress-test → DSQL only ────────────────────────────
  R_STR --> T_MEM

  %% ── Debug + Setup → DSQL ───────────────────────────────
  R_DBG --> T_AG & T_MEM & T_REL
  R_SET --> T_AG & T_MEM & T_REL & T_EVT & T_USR

  %% ── Styles ─────────────────────────────────────────────
  classDef client  fill:#27272a,stroke:#52525b,color:#e4e4e7
  classDef api     fill:#1c1917,stroke:#78350f,color:#fdba74
  classDef dsql    fill:#172554,stroke:#1d4ed8,color:#93c5fd
  classDef dynamo  fill:#14532d,stroke:#16a34a,color:#86efac
  classDef dbtable fill:#18181b,stroke:#3f3f46,color:#a1a1aa

  class LC,MG,EF,MP,AM,DP,SC client
  class R_LOGIN,R_SESSION,R_LOGOUT,R_AG,R_AP,R_AD,R_MG,R_MP,R_EG,R_EP,R_MET,R_SIM,R_STR,R_DBG,R_SET api
  class T_AG,T_MEM,T_REL,T_EVT,T_USR dbtable
  class T_LOG dbtable
`;

// ─── Code snippets for FlowCards ────────────────────────────────────────────
const DUAL_WRITE = `// POST /api/simulate — writes to BOTH databases in one request
await executeSql(
  "INSERT INTO events (agent_id, action, payload) VALUES ($1, $2, $3::jsonb)",
  [agentId, action, JSON.stringify(payload)]                // → Aurora DSQL
);
await logEvent({ PK: \`AGENT#\${agentId}\`, SK: \`EVENT#\${ts}\`, action, payload });
//                                                          → DynamoDB`;

const METRICS_READ = `// GET /api/metrics — parallel read from both databases
const [dsqlCounts, dynamoScan] = await Promise.all([
  executeSql(
    \`SELECT EXTRACT(EPOCH FROM created_at)::bigint AS sec, COUNT(*)::int AS cnt
     FROM events WHERE created_at > NOW() - INTERVAL '10 seconds'
     GROUP BY sec ORDER BY sec ASC\`
  ),                                                        // → Aurora DSQL
  countRecentEvents(10),                                    // → DynamoDB Scan
]);`;

const MEMORY_GRAPH = `// GET /api/memory — JOIN across two DSQL tables
SELECT m.id, m.content, m.created_at,
       r.type, r.target_memory_id
FROM   memories m
LEFT JOIN relationships r
       ON r.source_memory_id = m.id
WHERE  m.agent_id = $1
ORDER  BY m.created_at ASC;`;

const DYNAMO_QUERY = `// GET /api/events — DynamoDB Query by partition key
await client.send(new QueryCommand({
  TableName: "SynapseEventLog",
  KeyConditionExpression: "PK = :pk",
  ExpressionAttributeValues: { ":pk": \`AGENT#\${agentId}\` },
  ScanIndexForward: false,   // newest first
  Limit: 50,
}));`;

// ─── Route reference ────────────────────────────────────────────────────────
const ROUTES = [
  { method: "POST",   path: "/api/auth/login",     db: "DSQL",         note: "Validates credentials against users table" },
  { method: "GET",    path: "/api/auth/session",   db: "DSQL",         note: "Reads httpOnly cookie, verifies against DB" },
  { method: "POST",   path: "/api/auth/logout",    db: "—",            note: "Clears session cookie, no DB call" },
  { method: "GET",    path: "/api/agents",         db: "DSQL",         note: "SELECT from agents table" },
  { method: "POST",   path: "/api/agents",         db: "DSQL",         note: "INSERT agent + SHA-256 hash API key" },
  { method: "DELETE", path: "/api/agents/:id",     db: "DSQL",         note: "CASCADE delete → memories, relationships" },
  { method: "GET",    path: "/api/memory",         db: "DSQL",         note: "SELECT memories LEFT JOIN relationships" },
  { method: "POST",   path: "/api/memory",         db: "DSQL",         note: "INSERT memory node + optional edge" },
  { method: "GET",    path: "/api/events",         db: "DynamoDB",     note: "QueryCommand by AGENT# partition key" },
  { method: "POST",   path: "/api/events",         db: "DynamoDB",     note: "PutCommand to SynapseEventLog" },
  { method: "GET",    path: "/api/metrics",        db: "DSQL + Dynamo",note: "Parallel read: DSQL counts + DynamoDB scan" },
  { method: "POST",   path: "/api/simulate",       db: "DSQL + Dynamo",note: "Dual-write: 5 memories + 8-10 events" },
  { method: "POST",   path: "/api/stress-test",    db: "DSQL",         note: "50 concurrent INSERT transactions (ACID proof)" },
  { method: "POST",   path: "/api/setup",          db: "DSQL",         note: "CREATE TABLE IF NOT EXISTS (all tables)" },
  { method: "GET",    path: "/api/debug",          db: "DSQL",         note: "Health check + row counts" },
];

const METHOD_COLOR: Record<string, string> = {
  GET:    "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
  POST:   "text-orange-400  border-orange-500/30  bg-orange-950/40",
  DELETE: "text-red-400     border-red-500/30     bg-red-950/40",
};

const DB_COLOR: Record<string, string> = {
  "DSQL":         "text-blue-400",
  "DynamoDB":     "text-emerald-400",
  "DSQL + Dynamo":"text-purple-400",
  "—":            "text-zinc-600",
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ArchitecturePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-14">

        {/* Header */}
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent font-mono">
            SYSTEM ARCHITECTURE
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            How Synapse Connects to Its Backends
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
            Every client component, API route, and database table — mapped end-to-end.
            Orange nodes are Vercel API routes. Blue is Aurora DSQL. Green is DynamoDB.
          </p>
        </div>

        {/* Mermaid diagram */}
        <section>
          <div className="border border-zinc-800 rounded-xl bg-zinc-950/60 p-6">
            <MermaidDiagram chart={DIAGRAM} />
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 flex-wrap">
            {[
              { color: "bg-zinc-700", label: "Client Component" },
              { color: "bg-orange-900/60 border border-orange-700/40", label: "API Route" },
              { color: "bg-blue-900/60 border border-blue-700/40", label: "Aurora DSQL" },
              { color: "bg-emerald-900/60 border border-emerald-700/40", label: "DynamoDB" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
                <span className="text-[11px] font-mono text-zinc-500">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <span className="inline-block h-px w-8 bg-purple-500/60" />
              <span className="text-[11px] font-mono text-zinc-500">dual-write (DSQL + DynamoDB)</span>
            </div>
          </div>
        </section>

        {/* Route reference table */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1 tracking-tight">Route → Database Map</h2>
          <p className="text-xs text-zinc-500 mb-4">Every API endpoint, its HTTP method, and the backend it hits.</p>

          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-normal w-16">Method</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-normal">Endpoint</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-normal w-32">Database</th>
                  <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-normal hidden md:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((r, i) => (
                  <tr
                    key={r.path + r.method}
                    className={`border-b border-zinc-800/50 ${i % 2 === 0 ? "" : "bg-zinc-900/20"} hover:bg-zinc-800/30`}
                  >
                    <td className="px-4 py-2.5">
                      <span className={`inline-block border rounded px-1.5 py-0.5 text-[10px] leading-none ${METHOD_COLOR[r.method] ?? ""}`}>
                        {r.method}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300">{r.path}</td>
                    <td className={`px-4 py-2.5 font-semibold ${DB_COLOR[r.db] ?? "text-zinc-400"}`}>{r.db}</td>
                    <td className="px-4 py-2.5 text-zinc-500 hidden md:table-cell">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key data flows */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1 tracking-tight">Key Data Flows</h2>
          <p className="text-xs text-zinc-500 mb-4">Click to expand the exact operations behind each request pattern.</p>

          <div className="space-y-3">
            <FlowCard
              title="Dual-Write — Simulate"
              steps={["POST /api/simulate", "INSERT INTO events (DSQL)", "PutCommand (DynamoDB)", "→ both databases"]}
              codeLabel="Dual-write pattern"
              code={DUAL_WRITE}
            />
            <FlowCard
              title="Parallel Read — Metrics"
              steps={["GET /api/metrics", "Promise.all([...])", "DSQL GROUP BY sec", "DynamoDB Scan"]}
              codeLabel="Parallel backend reads"
              code={METRICS_READ}
            />
            <FlowCard
              title="Graph Query — Memory"
              steps={["GET /api/memory", "SELECT + LEFT JOIN", "memories + relationships", "→ nodes + edges"]}
              codeLabel="DSQL join query"
              code={MEMORY_GRAPH}
            />
            <FlowCard
              title="Event Stream — DynamoDB"
              steps={["GET /api/events", "QueryCommand", "PK = AGENT#id", "→ chronological log"]}
              codeLabel="DynamoDB partition key query"
              code={DYNAMO_QUERY}
            />
          </div>
        </section>

        {/* Schema cards */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1 tracking-tight">Database Schemas</h2>
          <p className="text-xs text-zinc-500 mb-4">Aurora DSQL table definitions and the DynamoDB single-table design.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Aurora DSQL tables */}
            {[
              {
                name: "agents",
                color: "border-blue-500/30",
                columns: [
                  { col: "id",           type: "VARCHAR(36)",  note: "PK" },
                  { col: "name",         type: "VARCHAR(255)", note: "" },
                  { col: "api_key_hash", type: "VARCHAR(255)", note: "SHA-256" },
                  { col: "created_at",   type: "TIMESTAMPTZ",  note: "DEFAULT NOW()" },
                ],
              },
              {
                name: "memories",
                color: "border-blue-500/30",
                columns: [
                  { col: "id",         type: "VARCHAR(36)", note: "PK" },
                  { col: "agent_id",   type: "VARCHAR(36)", note: "FK → agents" },
                  { col: "content",    type: "TEXT",        note: "" },
                  { col: "created_at", type: "TIMESTAMPTZ", note: "DEFAULT NOW()" },
                ],
              },
              {
                name: "relationships",
                color: "border-blue-500/30",
                columns: [
                  { col: "id",               type: "VARCHAR(36)", note: "PK" },
                  { col: "source_memory_id", type: "VARCHAR(36)", note: "FK → memories" },
                  { col: "target_memory_id", type: "VARCHAR(36)", note: "FK → memories" },
                  { col: "type",             type: "VARCHAR(100)",note: "e.g. relates_to" },
                ],
              },
              {
                name: "events",
                color: "border-blue-500/30",
                columns: [
                  { col: "id",         type: "UUID",        note: "PK, gen_random_uuid()" },
                  { col: "agent_id",   type: "VARCHAR(36)", note: "FK → agents" },
                  { col: "action",     type: "VARCHAR(100)",note: "" },
                  { col: "payload",    type: "JSONB",       note: "DEFAULT '{}'" },
                  { col: "created_at", type: "TIMESTAMPTZ", note: "DEFAULT NOW()" },
                ],
              },
              {
                name: "users",
                color: "border-blue-500/30",
                columns: [
                  { col: "id",            type: "UUID",        note: "PK, gen_random_uuid()" },
                  { col: "email",         type: "VARCHAR(255)", note: "UNIQUE" },
                  { col: "password_hash", type: "VARCHAR(255)", note: "bcrypt" },
                  { col: "created_at",    type: "TIMESTAMPTZ",  note: "DEFAULT NOW()" },
                ],
              },
            ].map((t) => (
              <div key={t.name} className={`border ${t.color} bg-zinc-900/40 rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-300 tracking-wide">{t.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Aurora DSQL</span>
                </div>
                <table className="w-full text-[11px] font-mono">
                  <tbody>
                    {t.columns.map((c) => (
                      <tr key={c.col} className="border-t border-zinc-800/60">
                        <td className="py-1.5 pr-3 text-zinc-300">{c.col}</td>
                        <td className="py-1.5 pr-3 text-orange-400/80">{c.type}</td>
                        <td className="py-1.5 text-zinc-600">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* DynamoDB single-table */}
            <div className="border border-emerald-500/30 bg-zinc-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-300 tracking-wide">SynapseEventLog</span>
                <span className="ml-auto text-[10px] font-mono text-zinc-600 uppercase tracking-widest">DynamoDB</span>
              </div>
              <table className="w-full text-[11px] font-mono">
                <tbody>
                  {[
                    { col: "PK",        type: "String",  note: "AGENT#<agentId>" },
                    { col: "SK",        type: "String",  note: "EVENT#<ISO8601>" },
                    { col: "action",    type: "String",  note: "e.g. MEMORY_CREATED" },
                    { col: "payload",   type: "Map",     note: "arbitrary JSON" },
                    { col: "timestamp", type: "String",  note: "ISO8601, for scan filter" },
                  ].map((c) => (
                    <tr key={c.col} className="border-t border-zinc-800/60">
                      <td className="py-1.5 pr-3 text-zinc-300">{c.col}</td>
                      <td className="py-1.5 pr-3 text-orange-400/80">{c.type}</td>
                      <td className="py-1.5 text-zinc-600">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[10px] font-mono text-zinc-600 border-t border-zinc-800 pt-3">
                Single-table design · on-demand capacity · Query by PK for per-agent stream · Scan by timestamp for metrics
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
