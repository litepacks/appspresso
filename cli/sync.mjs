/**
 * Dev/CI helpers for offline sync diagnostics (no live DB on web IDB from Node).
 */

export function printSyncHelp() {
  console.log(`
appspresso sync — offline sync diagnostics (dev)

  sync status     Pending/dead counts guidance (run in app DebugPanel for live state)
  sync check      Verify sync modules are present in the package
  sync flush      Hint: call flushOutbox() from the running app
  sync pull       Hint: call syncEnginePullOnly() from the running app
  sync reset      Hint: DebugPanel nuclear reset or clearWebOutbox in dev
  sync conflicts  Hint: listUnresolvedConflicts() in app

CLI cannot open the device SQLite/IndexedDB from Node; use DebugPanel or Maestro for live data.
`);
}

export async function runSyncCommand(sub, _cwd) {
  switch (sub) {
    case "status":
      console.log("Sync status is available in-app via syncStatusAtom / DebugPanel.");
      console.log("Fields: pendingCount, deadCount, healthScore, lastFlushAt, pausedReason");
      return;
    case "check": {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const root = path.join(process.cwd(), "node_modules", "appspresso", "dist-lib", "sync");
      const ok = fs.existsSync(path.join(root, "index.js"));
      console.log(ok ? "OK: appspresso/sync export found" : "WARN: build appspresso or install package");
      return;
    }
    case "flush":
      console.log("Run flushOutbox() from the host app (online event or DebugPanel).");
      return;
    case "pull":
      console.log("Run syncEnginePullOnly() after registerSyncProvider with pull.");
      return;
    case "reset":
      console.log("Dev reset: clearWebOutbox() + outbox store clearDevOnly in DebugPanel.");
      return;
    case "conflicts":
      console.log("Use listUnresolvedConflicts() from appspresso/sync in the app.");
      return;
    default:
      printSyncHelp();
      process.exit(sub ? 1 : 0);
  }
}
