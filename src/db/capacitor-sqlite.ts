import type { CapacitorSQLitePlugin } from "@capacitor-community/sqlite";

let sqliteModule: typeof import("@capacitor-community/sqlite") | undefined;

/** Lazy-load SQLite plugin so the WebView does not parse it on first paint. */
export async function loadCapacitorSQLite(): Promise<CapacitorSQLitePlugin> {
  sqliteModule ??= await import("@capacitor-community/sqlite");
  return sqliteModule.CapacitorSQLite;
}
