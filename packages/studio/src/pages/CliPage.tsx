const COMMANDS = [
  { cmd: "appspresso doctor", desc: "Environment and dependency checks" },
  { cmd: "appspresso analyze", desc: "Project structure analysis" },
  { cmd: "appspresso studio --check", desc: "Headless validation (CI)" },
  { cmd: "appspresso cap:config", desc: "Write capacitor.config.json" },
  { cmd: "appspresso native sync", desc: "Sync web assets to native" },
];

export function CliPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Run these commands from your project root.
      </p>
      <div className="studio-panel divide-y divide-border/40">
        {COMMANDS.map(({ cmd, desc }) => (
          <div key={cmd} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="font-mono text-xs text-foreground">{cmd}</code>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
