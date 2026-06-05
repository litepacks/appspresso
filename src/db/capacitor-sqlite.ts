/** Minimal surface used by the app — avoids static `@capacitor-community/sqlite` in the graph. */
export type CapacitorSQLitePlugin = {
  createConnection: (opts: Record<string, unknown>) => Promise<void>;
  open: (opts: { database: string }) => Promise<void>;
  close: (opts: { database: string; readonly?: boolean }) => Promise<void>;
  closeConnection: (opts: { database: string; readonly?: boolean }) => Promise<void>;
  deleteDatabase: (opts: { database: string }) => Promise<void>;
  run: (opts: Record<string, unknown>) => Promise<{ changes?: { changes: number } }>;
  query: (opts: Record<string, unknown>) => Promise<{ values?: unknown[][] }>;
  execute: (opts: Record<string, unknown>) => Promise<{ changes?: { changes: number } }>;
};

let sqliteModule: { CapacitorSQLite: CapacitorSQLitePlugin } | undefined;

/** Lazy-load SQLite plugin so the WebView does not parse it on first paint. */
export async function loadCapacitorSQLite(): Promise<CapacitorSQLitePlugin> {
  sqliteModule ??= (await import(
    "@capacitor-community/sqlite"
  )) as typeof sqliteModule & { CapacitorSQLite: CapacitorSQLitePlugin };
  return sqliteModule.CapacitorSQLite;
}
