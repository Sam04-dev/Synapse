"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { ENDPOINTS, PYTHON_SDK } from "@/lib/api-docs-data";

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() { await navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  function highlight(code: string) {
    return code
      .replace(/"([^"]*)"(\s*:)/g, '<span class="text-blue-400">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span class="text-emerald-400">"$1"</span>')
      .replace(/:\s*(true|false|null|\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
      .replace(/(curl|python3|pip|POST|GET|import|from|print|requests)/g, '<span class="text-purple-400">$1</span>')
      .replace(/(--[a-zA-Z-]+)/g, '<span class="text-blue-400">$1</span>')
      .replace(/(https?:\/\/[^\s"']+)/g, '<span class="text-emerald-400">$1</span>')
      .replace(/#.*/gm, (m) => `<span class="text-zinc-500">${m}</span>`);
  }

  return (
    <div className="relative group border border-foreground/10 bg-[hsl(0,0%,5%)]">
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent">
        {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      </button>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-6 text-foreground/80" dangerouslySetInnerHTML={{ __html: highlight(children) }} />
    </div>
  );
}

function Badge({ method }: { method: string }) {
  const c = method === "POST" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return <span className={`inline-block border px-2 py-0.5 text-xs font-mono font-bold tracking-wider ${c}`}>{method}</span>;
}

export default function DocsPage() {
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">{"// API_DOCUMENTATION"}</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <h1 className="text-lg font-mono tracking-[0.15em] uppercase text-foreground mb-1">Synapse REST API</h1>
        <p className="text-sm font-mono text-muted-foreground mb-8">Endpoints for agent memory, relationships, and event logging.</p>

        {ENDPOINTS.map((ep) => (
          <div key={ep.path + ep.method} className="mb-8 border-2 border-foreground/10">
            <div className="flex items-center gap-3 border-b border-foreground/10 bg-card px-4 py-3">
              <Badge method={ep.method} />
              <code className="font-mono text-sm text-foreground">{ep.path}</code>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-mono text-muted-foreground mb-4">{ep.description}</p>
              <p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-1.5">{ep.method === "GET" ? "REQUEST" : "REQUEST BODY"}</p>
              <CodeBlock>{ep.request}</CodeBlock>
              <p className="mt-4 text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-1.5">RESPONSE</p>
              <CodeBlock>{ep.response}</CodeBlock>
              <p className="mt-4 text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground/60 mb-1.5">CURL</p>
              <CodeBlock>{ep.curl}</CodeBlock>
            </div>
          </div>
        ))}

        <div className="mb-8 border-2 border-foreground/10">
          <div className="flex items-center gap-3 border-b border-foreground/10 bg-card px-4 py-3">
            <span className="inline-block border px-2 py-0.5 text-xs font-mono font-bold tracking-wider bg-amber-500/15 text-amber-400 border-amber-500/30">PYTHON</span>
            <code className="font-mono text-sm text-foreground">SDK Quick Start</code>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-mono text-muted-foreground mb-4">Integrate Synapse into your Python AI agent in minutes.</p>
            <CodeBlock>{PYTHON_SDK}</CodeBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
