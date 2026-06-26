"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WelcomeOverlay from "@/components/WelcomeOverlay";

interface Props {
  onComplete: (email: string, password: string) => void;
}

const DEMO_EMAIL = "robertsamueli40@gmail.com";
const DEMO_PASS = "Synapse@123";

export default function LoginScreen({ onComplete }: Props) {
  const params = useSearchParams();
  const registered = params.get("registered") === "1";
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASS);
  const [phase, setPhase] = useState<"form" | "loading" | "welcome">("form");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Email and password are required"); return; }
    setError("");

    // Try real auth first
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) { setPhase("loading"); return; }
      const data = (await res.json()) as { error?: string };
      // If real auth fails, try demo credentials before showing error
      if (email.trim().toLowerCase() !== DEMO_EMAIL.toLowerCase() || password !== DEMO_PASS) {
        setError(data.error ?? "Invalid credentials");
        return;
      }
    } catch { /* network error — fall through to demo check */ }

    // Demo credentials fallback
    if (email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASS) {
      setPhase("loading");
    } else {
      setError("Invalid credentials");
    }
  }

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setPhase("welcome"); return 100; }
        return p + 2;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [phase]);

  const handleWelcomeComplete = useCallback(() => {
    onComplete(email, password);
  }, [onComplete, email, password]);

  if (phase === "welcome") return <WelcomeOverlay onComplete={handleWelcomeComplete} />;

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="mb-10 flex items-baseline gap-1">
          <span className="text-2xl font-mono tracking-[0.3em] uppercase text-foreground font-bold">SYNAPSE</span>
          <span className="h-2 w-2 bg-accent" />
        </div>
        <div className="w-64">
          <div className="h-[2px] w-full bg-foreground/10">
            <div className="h-full bg-accent transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex justify-between">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">AUTHENTICATING</span>
            <span className="text-[11px] font-mono text-muted-foreground">{progress}%</span>
          </div>
        </div>
        <p className="absolute bottom-6 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/40">v0.1.0 — MEMORY ENGINE</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-2xl font-mono tracking-[0.3em] uppercase text-foreground font-bold">SYNAPSE</span>
        <span className="h-2 w-2 bg-accent" />
      </div>

      <p className="mb-6 text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">SIGN IN TO YOUR ACCOUNT</p>

      <form onSubmit={handleSubmit} className="w-72">
        <div className="mb-3">
          <label className="block mb-1 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">EMAIL</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-foreground/20 bg-card px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none"
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">PASSWORD</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border-2 border-foreground/20 bg-card px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none"
          />
        </div>

        {registered && !error && (
          <p className="mb-3 text-xs font-mono text-emerald-400 uppercase tracking-wide">Account created — please sign in</p>
        )}
        {error && <p className="mb-3 text-xs font-mono text-destructive uppercase tracking-wide">{error}</p>}

        <button type="submit" className="w-full bg-accent text-accent-foreground py-2.5 text-xs font-mono tracking-[0.15em] uppercase transition-all hover:bg-accent/90 active:scale-[0.98]">
          SIGN IN
        </button>
      </form>

      <p className="mt-5 text-[11px] font-mono text-muted-foreground/50">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:underline">Create one</Link>
      </p>

      <p className="absolute bottom-6 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/40">v0.1.0 — MEMORY ENGINE</p>
    </div>
  );
}
