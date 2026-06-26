"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import WaitlistModal from "@/components/pricing/WaitlistModal";

interface Tier {
  name: string;
  price: string;
  tagline: string;
  featured: boolean;
  features: string[];
  cta: string;
  ctaAction: "link" | "subscribe" | "sales";
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$0 / month",
    tagline: "For solo developers and prototypes",
    featured: false,
    features: [
      "1 active agent namespace",
      "1,000 memory nodes",
      "10,000 events / month",
      "7-day memory retention",
      "Community support",
    ],
    cta: "Get Started",
    ctaAction: "link",
  },
  {
    name: "Pro",
    price: "$49 / month",
    tagline: "For growing AI teams",
    featured: true,
    features: [
      "10 active agent namespaces",
      "100,000 memory nodes",
      "1M events / month",
      "Unlimited memory retention",
      "Real-time memory graph",
      "Priority email support",
      "Team collaboration (shared namespaces)",
    ],
    cta: "Subscribe",
    ctaAction: "subscribe",
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For production-scale deployments",
    featured: false,
    features: [
      "Unlimited agent namespaces",
      "Unlimited memory nodes & events",
      "Custom SLA & dedicated support",
      "On-premise deployment option",
      "SSO & advanced security",
      "Audit logs & compliance reporting",
    ],
    cta: "Contact Sales",
    ctaAction: "sales",
  },
];

const PLAN_TO_TIER: Record<string, string> = {
  free: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function PricingCard({
  tier,
  isCurrent,
  onCta,
}: {
  tier: Tier;
  isCurrent: boolean;
  onCta: (action: "subscribe" | "sales") => void;
}) {
  return (
    <div
      className={`relative flex flex-col p-6 border bg-[#111] transition-all ${
        isCurrent
          ? "border-emerald-500/60 shadow-[0_0_32px_rgba(16,185,129,0.07)]"
          : tier.featured
          ? "border-[#ff6b35] shadow-[0_0_32px_rgba(255,107,53,0.08)]"
          : "border-[#222]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 min-h-[22px]">
        {isCurrent && (
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-mono tracking-[0.15em] uppercase text-emerald-400">
            Your Plan
          </span>
        )}
        {tier.featured && !isCurrent && (
          <span className="rounded-full bg-[#ff6b35] px-3 py-0.5 text-[10px] font-mono tracking-[0.15em] uppercase text-white">
            Most Popular
          </span>
        )}
      </div>

      <h3 className="mb-1 text-[11px] font-mono tracking-[0.25em] uppercase text-[#888]">
        {tier.name}
      </h3>
      <p className="mb-4 text-2xl font-mono font-bold text-white">{tier.price}</p>
      <p className="mb-5 text-[11px] font-mono text-[#555]">{tier.tagline}</p>

      <ul className="mb-6 flex-1 space-y-2.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check size={12} className="mt-0.5 shrink-0 text-[#ff6b35]" />
            <span className="text-[12px] font-mono text-[#999]">{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="w-full py-2.5 text-center text-[11px] font-mono tracking-[0.15em] uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center gap-1.5">
          <Check size={11} />
          Current Plan
        </div>
      ) : tier.ctaAction === "link" ? (
        <Link
          href="/signup"
          className="w-full border border-[#333] py-2.5 text-center text-[11px] font-mono tracking-[0.15em] uppercase text-white hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
        >
          {tier.cta}
        </Link>
      ) : (
        <button
          onClick={() => onCta(tier.ctaAction as "subscribe" | "sales")}
          className={`w-full py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase transition-colors ${
            tier.featured
              ? "bg-[#ff6b35] text-white hover:bg-[#ff6b35]/90"
              : "border border-[#444] text-white hover:border-[#666]"
          }`}
        >
          {tier.cta}
        </button>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [modal, setModal] = useState<"subscribe" | "sales" | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    async function detectPlan() {
      try {
        const res = await fetch("/api/auth/session");
        const data = (await res.json()) as { user: { id: string } | null };
        if (data.user) { setUserPlan("pro"); return; }
      } catch { /* silent */ }
      try {
        const stored = sessionStorage.getItem("synapse_auth");
        if (stored) {
          const parsed = JSON.parse(stored) as { plan?: string };
          if (parsed?.plan) setUserPlan(parsed.plan);
        }
      } catch { /* silent */ }
    }
    detectPlan();
  }, []);

  const currentTierName = userPlan ? (PLAN_TO_TIER[userPlan] ?? null) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h1 className="mb-3 text-3xl font-mono font-bold tracking-[0.06em] text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-sm font-mono text-[#555]">Start free. Scale with your agents.</p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              isCurrent={tier.name === currentTierName}
              onCta={setModal}
            />
          ))}
        </div>

        <ComparisonTable />

        <p className="mt-12 text-center text-[11px] font-mono text-[#444]">
          Need help choosing?{" "}
          <a
            href="mailto:founders@synapse.engine"
            className="text-[#666] underline underline-offset-2 hover:text-white transition-colors"
          >
            Contact us at founders@synapse.engine
          </a>
        </p>
      </div>

      {modal && <WaitlistModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
