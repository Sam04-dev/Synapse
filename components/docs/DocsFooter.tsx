"use client";

import Link from "next/link";

export default function DocsFooter() {
  return (
    <footer className="border-t border-zinc-800 mt-20 pt-8 text-center">
      <p className="text-sm text-zinc-500">
        Synapse is open for early access. Built for the
        Vercel &amp; AWS Hackathon.
      </p>

      <Link
        href="/"
        className="inline-block mt-6 bg-accent text-white font-semibold rounded-lg px-8 py-3 text-sm tracking-wide hover:bg-accent/90 transition-colors"
      >
        Return to Dashboard
      </Link>
    </footer>
  );
}
