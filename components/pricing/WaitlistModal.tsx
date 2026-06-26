"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  type: "subscribe" | "sales";
  onClose: () => void;
}

const CONTENT = {
  subscribe: {
    title: "Coming Soon",
    body: "Subscription billing is currently in development. We're onboarding Pro users manually. Leave your email to get early access.",
    button: "Join Waitlist",
  },
  sales: {
    title: "Enterprise Inquiry",
    body: "Our team will reach out within 24 hours to discuss your deployment requirements.",
    button: "Submit",
  },
};

export default function WaitlistModal({ type, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    console.log(`[Pricing] ${type} inquiry:`, email.trim());
    setSubmitted(true);
  }

  const { title, body, button } = CONTENT[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md border border-[#2a2a2a] bg-[#111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222] px-5 py-3.5">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-[#444] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-6">
          {submitted ? (
            <div className="flex flex-col items-center py-4 text-center">
              <p className="text-sm font-mono text-[#ff6b35] mb-1.5">You&apos;re on the list.</p>
              <p className="text-[11px] font-mono text-[#555]">
                Thanks! We&apos;ll be in touch soon.
              </p>
              <button
                onClick={onClose}
                className="mt-6 border border-[#333] px-6 py-2 text-[10px] font-mono tracking-[0.15em] uppercase text-white hover:border-[#555] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-5 text-[12px] font-mono text-[#777] leading-relaxed">{body}</p>
              <label className="mb-1.5 block text-[10px] font-mono tracking-[0.2em] uppercase text-[#444]">
                Your Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mb-4 w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 text-xs font-mono text-white placeholder:text-[#333] focus:border-[#ff6b35] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#ff6b35] py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase text-white hover:bg-[#ff6b35]/90 transition-colors"
              >
                {button}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
