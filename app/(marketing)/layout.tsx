import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono">
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="#ff6b35">
              <polygon points="10,2 18,17 2,17" />
            </svg>
            <span className="text-sm font-mono tracking-[0.3em] uppercase text-white font-bold">
              SYNAPSE
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#666] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#666] hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/"
              className="border border-[#333] px-4 py-1.5 text-[11px] font-mono tracking-[0.15em] uppercase text-white hover:border-[#ff6b35] hover:text-[#ff6b35] transition-colors"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
