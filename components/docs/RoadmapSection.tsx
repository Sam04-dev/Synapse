"use client";

const MILESTONES: {
  badge: string;
  color: string;
  dot: string;
  features: string;
  indent?: boolean;
}[] = [
  {
    badge: "V1.0 — CURRENT",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    dot: "bg-orange-500",
    features:
      "Relational Memory Nodes • Cross-Agent State • Event Streaming • REST API",
  },
  {
    badge: "V1.5 — Q3 2027",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-500",
    features:
      "Temporal Graph Queries • Native LangChain Integration • Memory Pruning (TTL)",
    indent: true,
  },
  {
    badge: "V2.0 — Q4 2028",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    dot: "bg-purple-500",
    features:
      "Vector + Relational Hybrid Search • Multi-Agent Swarm Orchestration • SOC2 Compliance",
  },
  {
    badge: "V3.0 — 2029",
    color: "bg-zinc-600/15 text-zinc-400 border-zinc-600/30",
    dot: "bg-zinc-500",
    features:
      "Autonomous Self-Healing Memory • Cross-Cloud State Sync • Agent-to-Agent Economic Protocols",
    indent: true,
  },
];

export default function RoadmapSection() {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        The Roadmap
      </h2>
      <p className="mt-3 text-zinc-400 leading-relaxed max-w-2xl">
        We are building the definitive infrastructure for
        autonomous systems.
      </p>

      <div className="mt-10 border-l-2 border-zinc-800 pl-8 space-y-12">
        {MILESTONES.map((m) => (
          <div
            key={m.badge}
            className={m.indent ? "ml-12" : ""}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${m.dot} -ml-[calc(2rem+5px)]`} />
              <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase ${m.color}`}>
                {m.badge}
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {m.features}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
