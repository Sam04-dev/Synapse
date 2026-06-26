export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 0 || diff < 5000) return "just now";
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function actionColor(action: string): string {
  const upper = action.toUpperCase();
  if (upper.includes("MEMORY")) return "border-blue-500/50 text-blue-400 bg-blue-500/10";
  if (upper.includes("AUDIT")) return "border-purple-500/50 text-purple-400 bg-purple-500/10";
  if (upper.includes("TICKET") || upper.includes("PROCESS")) return "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
  if (upper.includes("ERROR")) return "border-red-500/50 text-red-400 bg-red-500/10";
  if (upper.includes("STATE")) return "border-cyan-500/50 text-cyan-400 bg-cyan-500/10";
  if (upper.includes("COMPLIANCE") || upper.includes("FLAG")) return "border-amber-500/50 text-amber-400 bg-amber-500/10";
  if (upper.includes("INCIDENT")) return "border-red-500/50 text-red-400 bg-red-500/10";
  if (upper.includes("PROMOTION")) return "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
  if (upper.includes("STRATEGY")) return "border-purple-500/50 text-purple-400 bg-purple-500/10";
  return "border-foreground/20 text-muted-foreground bg-secondary";
}
