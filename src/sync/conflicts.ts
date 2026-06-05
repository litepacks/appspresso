import { Capacitor } from "@capacitor/core";
import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { SQLITE_DB_NAME } from "@/db/constants";
import { isSqliteOpen } from "@/db/sqlite-open";
import type { ConflictStrategy } from "./provider";

export type ConflictRecord = {
  id: number;
  entityType: string;
  entityLocalId: string;
  remoteId?: string | null;
  strategy: ConflictStrategy;
  localSnapshot: string;
  remoteSnapshot: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string | null;
};

const webConflictsKey = "appspresso_conflicts_web";

function readWebConflicts(): ConflictRecord[] {
  try {
    const raw = localStorage.getItem(webConflictsKey);
    return raw ? (JSON.parse(raw) as ConflictRecord[]) : [];
  } catch {
    return [];
  }
}

function writeWebConflicts(rows: ConflictRecord[]): void {
  localStorage.setItem(webConflictsKey, JSON.stringify(rows));
}

export async function logConflict(input: {
  entityType: string;
  entityLocalId: string;
  remoteId?: string;
  strategy: ConflictStrategy;
  local: unknown;
  remote: unknown;
}): Promise<number> {
  const now = new Date().toISOString();
  const localSnapshot = JSON.stringify(input.local);
  const remoteSnapshot = JSON.stringify(input.remote);

  if (Capacitor.getPlatform() === "web") {
    const rows = readWebConflicts();
    const id = (rows.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
    rows.push({
      id,
      entityType: input.entityType,
      entityLocalId: input.entityLocalId,
      remoteId: input.remoteId ?? null,
      strategy: input.strategy,
      localSnapshot,
      remoteSnapshot,
      resolved: false,
      createdAt: now,
    });
    writeWebConflicts(rows);
    return id;
  }

  if (!isSqliteOpen()) return -1;
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: SQLITE_DB_NAME,
    statement: `INSERT INTO appspresso_conflicts(
      entity_type, entity_local_id, remote_id, strategy,
      local_snapshot, remote_snapshot, resolved, created_at
    ) VALUES(?,?,?,?,?,?,0,?)`,
    values: [
      input.entityType,
      input.entityLocalId,
      input.remoteId ?? null,
      input.strategy,
      localSnapshot,
      remoteSnapshot,
      now,
    ],
  });
  const res = await CapacitorSQLite.query({
    database: SQLITE_DB_NAME,
    statement: "SELECT last_insert_rowid()",
  });
  return Number(res?.values?.[0]?.[0] ?? -1);
}

export async function listUnresolvedConflicts(
  limit = 50,
): Promise<ConflictRecord[]> {
  if (Capacitor.getPlatform() === "web") {
    return readWebConflicts()
      .filter((r) => !r.resolved)
      .slice(0, limit);
  }
  if (!isSqliteOpen()) return [];
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: SQLITE_DB_NAME,
    statement: `SELECT id, entity_type, entity_local_id, remote_id, strategy,
      local_snapshot, remote_snapshot, resolved, created_at, resolved_at
      FROM appspresso_conflicts WHERE resolved = 0 ORDER BY id DESC LIMIT ?`,
    values: [limit],
  });
  return (res?.values ?? []).map((row) => ({
    id: Number(row[0]),
    entityType: String(row[1]),
    entityLocalId: String(row[2]),
    remoteId: row[3] != null ? String(row[3]) : null,
    strategy: row[4] as ConflictStrategy,
    localSnapshot: String(row[5]),
    remoteSnapshot: String(row[6]),
    resolved: Boolean(row[7]),
    createdAt: String(row[8]),
    resolvedAt: row[9] != null ? String(row[9]) : null,
  }));
}

export async function clearConflictsDevOnly(): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    localStorage.removeItem(webConflictsKey);
    return;
  }
  if (!isSqliteOpen()) return;
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: SQLITE_DB_NAME,
    statement: "DELETE FROM appspresso_conflicts",
  });
}
