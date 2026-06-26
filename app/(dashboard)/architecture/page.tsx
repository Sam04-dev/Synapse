"use client";

import { Bot, Globe, Database, Layers } from "lucide-react";
import ArchBox from "@/components/architecture/ArchBox";
import AnimatedLine from "@/components/architecture/AnimatedLine";
import FlowCard from "@/components/architecture/FlowCard";

const WRITE_SQL = `INSERT INTO memories (id, agent_id, content)
VALUES ($1, $2, $3)
RETURNING id, content, created_at`;

const EVENT_DYNAMO = `PutCommand({
  TableName: "SynapseEventLog",
  Item: {
    PK: "AGENT#<agentId>",
    SK: "EVENT#<ISO8601>",
    action: "MEMORY_CREATED",
    payload: { ... }
  }
})`;

const READ_SQL = `SELECT m.id, m.content, m.created_at,
       r.type, r.target_memory_id
FROM memories m
LEFT JOIN relationships r
  ON r.source_memory_id = m.id
WHERE m.agent_id = $1
ORDER BY m.created_at ASC`;

export default function ArchitecturePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent font-mono">
          SYSTEM ARCHITECTURE
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          How Synapse Works
        </h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-xl">
          A dual-database architecture combining ACID-compliant
          relational state with infinite-scale event streaming.
        </p>

        {/* Diagram */}
        <div className="mt-12 flex items-start justify-center gap-0">
          <ArchBox
            icon={Bot}
            title="AI Agent"
            bullets={[
              "LangChain / CrewAI / Custom",
              "Sends REST API calls",
              "Receives structured state",
            ]}
            borderColor="border-zinc-700"
            iconColor="text-zinc-400"
          />
          <AnimatedLine color="#f97316" label="REST" />
          <ArchBox
            icon={Globe}
            title="Vercel Edge"
            bullets={[
              "Next.js API Routes",
              "Request validation",
              "Dual-write orchestration",
            ]}
            borderColor="border-orange-500/40"
            iconColor="text-orange-400"
          />

          <div className="flex flex-col items-center gap-6 ml-1">
            <div className="flex items-center">
              <AnimatedLine color="#3b82f6" label="SQL" />
              <ArchBox
                icon={Database}
                title="Aurora DSQL"
                bullets={[
                  "Agents, Memories, Relationships",
                  "SERIALIZABLE isolation",
                  "Sub-20ms latency",
                ]}
                borderColor="border-blue-500/40"
                iconColor="text-blue-400"
              />
            </div>
            <div className="flex items-center">
              <AnimatedLine color="#22c55e" label="PUT" />
              <ArchBox
                icon={Layers}
                title="DynamoDB"
                bullets={[
                  "Single-table event log",
                  "PK: AGENT# / SK: EVENT#",
                  "On-demand, zero throttle",
                ]}
                borderColor="border-emerald-500/40"
                iconColor="text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Data Flow Examples */}
        <div className="mt-16">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Data Flow Examples
          </h2>
          <p className="text-xs text-zinc-500 mb-6">
            Click to expand and see the exact operations.
          </p>

          <div className="space-y-3">
            <FlowCard
              title="Writing a Memory"
              steps={[
                "AI Agent",
                "POST /api/memory",
                "INSERT INTO memories",
                "RETURN success",
              ]}
              codeLabel="DSQL Operation"
              code={WRITE_SQL}
            />
            <FlowCard
              title="Logging an Event"
              steps={[
                "AI Agent",
                "POST /api/events",
                "PutCommand → DynamoDB",
                "RETURN success",
              ]}
              codeLabel="DynamoDB Operation"
              code={EVENT_DYNAMO}
            />
            <FlowCard
              title="Reading Agent State"
              steps={[
                "AI Agent",
                "GET /api/memory?agentId=",
                "SELECT + JOIN",
                "RETURN graph data",
              ]}
              codeLabel="DSQL Query"
              code={READ_SQL}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
