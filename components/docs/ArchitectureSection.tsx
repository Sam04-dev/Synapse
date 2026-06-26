"use client";

const BOX =
  "bg-zinc-800/50 border border-zinc-700 rounded-lg px-6 py-4 text-center font-mono text-sm text-zinc-300";

export default function ArchitectureSection() {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        Built for the Edge
      </h2>

      <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
        <div className={BOX}>Your AI Agent</div>
        <span className="text-zinc-600 text-2xl">→</span>
        <div className={BOX}>Vercel Edge Function</div>
        <span className="text-zinc-600 text-2xl">→</span>
        <div className="flex flex-col gap-2">
          <div className={BOX}>Aurora DSQL (State)</div>
          <div className={BOX}>DynamoDB (Events)</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
          <p className="text-sm text-zinc-300 font-semibold mb-1">
            Aurora DSQL
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Handles relational memory graphs with sub-20ms
            latency.
          </p>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
          <p className="text-sm text-zinc-300 font-semibold mb-1">
            DynamoDB
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Ingests thousands of agent events per second
            without throttling.
          </p>
        </div>
      </div>
    </section>
  );
}
