import { Capacitor } from "@capacitor/core";
import { SQLITE_DB_NAME } from "@/db/constants";
import { isSqliteOpen } from "@/db/sqlite-open";
import { appspressoPackageConfig } from "@/config/appspresso.config";

const PREFIX = appspressoPackageConfig.storage.keyPrefix;

async function nativeGet(key: string): Promise<string | null> {
  if (!isSqliteOpen()) return null;
  const { loadCapacitorSQLite } = await import("@/db/capacitor-sqlite");
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: SQLITE_DB_NAME,
    statement:
      "SELECT value FROM appspresso_sync_state WHERE key = ? LIMIT 1",
    values: [key],
  });
  const row = res?.values?.[0];
  return row ? String(row[0]) : null;
}

async function nativeSet(key: string, value: string): Promise<void> {
  if (!isSqliteOpen()) return;
  const now = new Date().toISOString();
  const { loadCapacitorSQLite } = await import("@/db/capacitor-sqlite");
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: SQLITE_DB_NAME,
    statement:
      "INSERT INTO appspresso_sync_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    values: [key, value, now],
  });
}

function webKey(key: string): string {
  return `${PREFIX}sync_state_${key}`;
}

export async function getSyncState(key: string): Promise<string | null> {
  if (Capacitor.getPlatform() === "web") {
    return localStorage.getItem(webKey(key));
  }
  return nativeGet(key);
}

export async function setSyncState(key: string, value: string): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    localStorage.setItem(webKey(key), value);
    return;
  }
  await nativeSet(key, value);
}

export async function deleteSyncState(key: string): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    localStorage.removeItem(webKey(key));
    return;
  }
  if (!isSqliteOpen()) return;
  const { loadCapacitorSQLite } = await import("@/db/capacitor-sqlite");
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: SQLITE_DB_NAME,
    statement: "DELETE FROM appspresso_sync_state WHERE key = ?",
    values: [key],
  });
}

export const SYNC_STATE_KEYS = {
  enginePaused: "engine_paused_reason",
  lastPushAt: "last_push_at",
  lastPullAt: "last_pull_at",
  pullCursor: (entityType: string) => `pull_cursor:${entityType}`,
} as const;
