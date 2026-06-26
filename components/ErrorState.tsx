"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center border-2 border-destructive/30 bg-destructive/5">
        <AlertTriangle size={20} className="text-destructive" />
      </div>
      <p className="text-xs font-mono tracking-[0.15em] uppercase text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 border border-foreground/15 px-4 py-2 text-xs font-mono uppercase text-muted-foreground transition-all hover:border-accent hover:text-accent"
        >
          <RefreshCw size={12} /> RETRY
        </button>
      )}
    </div>
  );
}
