"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Signup failed"); return; }
      router.push("/?registered=1");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = (err: boolean) =>
    `w-full border-2 ${err ? "border-red-500/60" : "border-[#333]"} bg-[#0a0a0a] px-3 py-2.5 text-xs font-mono text-white placeholder:text-white/20 focus:border-[#ff6b35] focus:outline-none`;

  return (
    <div className="w-full max-w-[420px] px-4">
      {/* Brand */}
      <div className="mb-8 flex items-baseline gap-1.5 justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="#ff6b35"><polygon points="10,2 18,17 2,17" /></svg>
        <span className="text-xl font-mono tracking-[0.3em] uppercase text-white font-bold">SYNAPSE</span>
      </div>

      <p className="mb-6 text-center text-[11px] font-mono tracking-[0.15em] uppercase text-white/40">CREATE YOUR ACCOUNT</p>

      <div className="border border-[#222] bg-[#111] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/40">EMAIL</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoFocus
              className={inputCls(false)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/40">PASSWORD</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                className={inputCls(false)}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/40">CONFIRM PASSWORD</label>
            <input
              type={showPw ? "text" : "password"} required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password"
              className={inputCls(confirm.length > 0 && confirm !== password)}
            />
          </div>

          {error && (
            <p className="text-[11px] font-mono text-red-400 uppercase tracking-wide">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] text-white py-2.5 text-xs font-mono tracking-[0.15em] uppercase hover:bg-[#ff6b35]/90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-[11px] font-mono text-white/30">
        Already have an account?{" "}
        <Link href="/" className="text-[#ff6b35] hover:underline">Sign in</Link>
      </p>

      <p className="mt-10 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-white/15">
        v0.1.0 — MEMORY ENGINE
      </p>
    </div>
  );
}
