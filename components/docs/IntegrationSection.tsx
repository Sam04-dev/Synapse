"use client";

const CODE = `from synapse import SynapseClient

client = SynapseClient(api_key="sk-synapse-...")

# Remember a user preference
client.memory.create(
    agent_id="agent_abc",
    content="User prefers dark mode and concise answers"
)

# Retrieve context automatically
context = client.memory.query(agent_id="agent_abc")`;

export default function IntegrationSection() {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        Integration in 5 Minutes
      </h2>
      <p className="mt-3 text-zinc-400 leading-relaxed max-w-2xl">
        No complex orchestration frameworks required. Treat
        agent memory like a standard database.
      </p>

      <div className="mt-8 bg-zinc-950 border border-zinc-800 rounded-xl p-6 overflow-x-auto">
        <pre className="font-mono text-sm text-zinc-300 leading-relaxed">
          {CODE}
        </pre>
      </div>

      <p className="mt-4 text-xs text-zinc-500 tracking-wide">
        Works with LangChain, CrewAI, AutoGen, or raw SDK
        calls.
      </p>
    </section>
  );
}
