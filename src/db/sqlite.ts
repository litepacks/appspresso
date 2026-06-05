import { Capacitor } from "@capacitor/core";
import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { SQLITE_DB_NAME } from "@/db/constants";
import { runMigrations } from "@/db/migrate";
import { isSqliteOpen, markSqliteOpen } from "@/db/sqlite-open";
import { logger } from "@/lib/logger";
import type { SqliteSlice } from "@/state/atoms";

const DB = SQLITE_DB_NAME;

function slice(unavailable: boolean, messageKey?: string): SqliteSlice {
  return { available: !unavailable, messageKey };
}

export async function initDatabase(
  setStatus: (s: SqliteSlice) => void,
): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    setStatus(slice(true, "sqlite.webUnavailable"));
    return;
  }
  try {
    const CapacitorSQLite = await loadCapacitorSQLite();
    await CapacitorSQLite.createConnection({
      database: DB,
      version: 1,
      encrypted: false,
      mode: "no-encryption",
    });
    await CapacitorSQLite.open({ database: DB });
    await runMigrations();
    markSqliteOpen(true);
    setStatus(slice(false));
  } catch (e) {
    logger.error("initDatabase", { e: String(e) });
    setStatus(slice(true, "sqlite.error"));
  }
}

export async function getSetting(key: string): Promise<string | null> {
  if (!isSqliteOpen()) return null;
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: DB,
    statement: "SELECT value FROM app_settings WHERE key = ? LIMIT 1",
    values: [key],
  });
  const row = res?.values?.[0];
  if (!row) return null;
  return String(row[0] ?? "");
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (!isSqliteOpen()) return;
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: DB,
    statement:
      "INSERT INTO app_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    values: [key, value],
  });
}

export async function closeDatabase(): Promise<void> {
  if (!isSqliteOpen()) return;
  try {
    const CapacitorSQLite = await loadCapacitorSQLite();
    await CapacitorSQLite.close({ database: DB });
    await CapacitorSQLite.closeConnection({ database: DB });
  } catch (e) {
    logger.warn("closeDatabase", { e: String(e) });
  }
  markSqliteOpen(false);
}

export async function resetDatabaseMigrations(
  setStatus: (s: SqliteSlice) => void,
): Promise<void> {
  await closeDatabase();
  if (Capacitor.getPlatform() === "web") return;
  try {
    const CapacitorSQLite = await loadCapacitorSQLite();
    await CapacitorSQLite.deleteDatabase({ database: DB });
  } catch (e) {
    logger.warn("resetDatabase", { e: String(e) });
  }
  await initDatabase(setStatus);
}

export { isSqliteOpen, markSqliteOpen } from "@/db/sqlite-open";
