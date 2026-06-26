"use client";

export default function DocsHero() {
  return (
    <section className="text-center">
      <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent">
        SYNAPSE DOCS
      </span>

      <h1 className="mt-4 text-5xl font-extrabold text-white leading-tight">
        The Future of Agent Memory
      </h1>

      <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto">
        Moving beyond stateless LLM calls. Build autonomous
        AI that remembers, learns, and collaborates.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300">
          Powered by Aurora DSQL
        </span>
        <span className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm text-zinc-300">
          Deployed on Vercel Edge
        </span>
      </div>
    </section>
  );
}
