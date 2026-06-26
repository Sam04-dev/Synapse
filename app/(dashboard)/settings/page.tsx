export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
          {"// SETTINGS"}
        </span>
        <div className="flex-1 border-t border-border" />
      </div>
      <div className="border-2 border-foreground/20 px-6 py-8 text-center">
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
          NO SETTINGS AVAILABLE
        </p>
      </div>
    </div>
  );
}
