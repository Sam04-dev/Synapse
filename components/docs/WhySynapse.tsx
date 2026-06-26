"use client";

import { Brain, Zap, Shield } from "lucide-react";

const CARDS = [
  {
    icon: Brain,
    color: "text-orange-500",
    title: "ACID-Compliant State",
    text: `Agents don't just need vector search. They need
transactional integrity. Synapse uses Aurora DSQL to ensure
concurrent agents never corrupt shared state.`,
  },
  {
    icon: Zap,
    color: "text-blue-500",
    title: "Zero-Latency Handoffs",
    text: `When Agent A finishes a task, Agent B picks it up
instantly. Distributed SQL removes the polling bottleneck
of traditional architectures.`,
  },
  {
    icon: Shield,
    color: "text-purple-500",
    title: "Immutable Event Logs",
    text: `Every agent action is permanently logged in DynamoDB.
Full auditability, infinite scale, and perfect replayability
for AI debugging.`,
  },
] as const;

export default function WhySynapse() {
  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        Why Synapse?
      </h2>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
          >
            <card.icon className={`${card.color} mb-4`} size={28} />
            <h3 className="text-lg font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
