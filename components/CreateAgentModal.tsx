"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAgentModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create agent");
        return;
      }

      setApiKey(data.apiKey);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDone() {
    setName("");
    setDescription("");
    setApiKey(null);
    setError(null);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md border-2 border-foreground/20 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-foreground/20 px-4 py-3">
          <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
            {"// CREATE_AGENT"}
          </span>
          <button onClick={apiKey ? handleDone : onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        </div>

        {apiKey ? (
          /* Success state — show API key */
          <div className="px-4 py-6">
            <div className="mb-4 border-2 border-accent bg-accent/5 px-4 py-3">
              <p className="mb-1.5 text-xs font-mono tracking-[0.15em] uppercase text-accent">
                AGENT CREATED — COPY YOUR API KEY
              </p>
              <p className="text-[11px] font-mono text-muted-foreground mb-3">
                This key will not be shown again.
              </p>
              <div className="flex items-center gap-2 bg-background p-2 border border-foreground/10">
                <code className="flex-1 break-all font-mono text-xs text-foreground/80">
                  {apiKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 text-muted-foreground hover:text-accent transition-colors"
                >
                  {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <button
              onClick={handleDone}
              className="w-full bg-foreground text-primary-foreground py-2.5 text-xs font-mono tracking-[0.15em] uppercase transition-all hover:bg-accent hover:text-accent-foreground"
            >
              DONE — GO TO DASHBOARD
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="px-4 py-6">
            <div className="mb-4">
              <label className="block mb-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                AGENT NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. customer-support-ai"
                className="w-full border-2 border-foreground/20 bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                DESCRIPTION
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                className="w-full border-2 border-foreground/20 bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none"
              />
            </div>

            {error && (
              <p className="mb-4 text-xs font-mono text-destructive uppercase tracking-wide">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-foreground/20 py-2.5 text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground transition-all hover:border-foreground/40"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className="flex-1 bg-accent text-accent-foreground py-2.5 text-xs font-mono tracking-[0.15em] uppercase transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {creating ? "CREATING..." : "CREATE AGENT"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
