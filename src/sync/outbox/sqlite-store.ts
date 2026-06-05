import { Capacitor } from "@capacitor/core";
import { loadCapacitorSQLite } from "@/db/capacitor-sqlite";
import { SQLITE_DB_NAME } from "@/db/constants";
import { isSqliteOpen } from "@/db/sqlite-open";
import { createIdempotencyKey } from "../idempotency";
import type { OutboxEnqueueOptions, OutboxRecord, OutboxStatus } from "../types";
import { shouldMarkDead, scheduledAtFromAttempts } from "./backoff";
import type { OutboxStore } from "./types";

function mapRow(row: unknown[]): OutboxRecord {
  return {
    id: Number(row[0]),
    idempotencyKey: String(row[1]),
    entityType: String(row[2]),
    entityLocalId: row[3] != null ? String(row[3]) : null,
    action: row[4] as OutboxRecord["action"],
    operation: row[5] != null ? String(row[5]) : null,
    payload: String(row[6]),
    status: row[7] as OutboxStatus,
    attempts: Number(row[8]),
    lastError: row[9] != null ? String(row[9]) : null,
    createdAt: String(row[10]),
    updatedAt: String(row[11]),
    scheduledAt: row[12] != null ? String(row[12]) : null,
    syncedAt: row[13] != null ? String(row[13]) : null,
  };
}

const SELECT_COLS = `
  id, idempotency_key, entity_type, entity_local_id, action, operation, payload,
  status, attempts, last_error, created_at, updated_at, scheduled_at, synced_at
`;

async function run(statement: string, values: unknown[] = []) {
  const CapacitorSQLite = await loadCapacitorSQLite();
  await CapacitorSQLite.run({
    database: SQLITE_DB_NAME,
    statement,
    values,
  });
}

async function query(statement: string, values: unknown[] = []) {
  const CapacitorSQLite = await loadCapacitorSQLite();
  const res = await CapacitorSQLite.query({
    database: SQLITE_DB_NAME,
    statement,
    values,
  });
  return (res?.values ?? []) as unknown[][];
}

export function createSqliteOutboxStore(): OutboxStore {
  return {
    async enqueue(input) {
      if (Capacitor.getPlatform() === "web" || !isSqliteOpen()) {
        throw new Error("sqlite.outbox.unavailable");
      }
      const now = new Date().toISOString();
      const key =
        input.idempotencyKey ??
        createIdempotencyKey({
          entityType: input.entityType,
          entityLocalId: input.entityLocalId,
          action: input.action,
          payloadVersion: JSON.stringify(input.payload).length,
        });
      await run(
        `INSERT INTO appspresso_outbox(
          idempotency_key, entity_type, entity_local_id, action, operation, payload,
          status, attempts, created_at, updated_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
        [
          key,
          input.entityType,
          input.entityLocalId ?? null,
          input.action,
          input.operation ?? null,
          JSON.stringify(input.payload),
          "pending",
          0,
          now,
          now,
        ],
      );
    },

    async claimNext() {
      if (!isSqliteOpen()) return null;
      const now = new Date().toISOString();
      const rows = await query(
        `SELECT ${SELECT_COLS} FROM appspresso_outbox
         WHERE status = 'pending'
           AND (scheduled_at IS NULL OR scheduled_at <= ?)
         ORDER BY id ASC LIMIT 1`,
        [now],
      );
      const row = rows[0];
      if (!row) return null;
      const id = Number(row[0]);
      await run(
        `UPDATE appspresso_outbox SET status = 'processing', updated_at = ? WHERE id = ? AND status = 'pending'`,
        [now, id],
      );
      return mapRow(row);
    },

    async markSynced(id) {
      const now = new Date().toISOString();
      await run(
        `UPDATE appspresso_outbox SET status = 'synced', synced_at = ?, updated_at = ? WHERE id = ?`,
        [now, now, id],
      );
    },

    async markFailed(id, error, retryable) {
      const rows = await query(
        "SELECT attempts FROM appspresso_outbox WHERE id = ?",
        [id],
      );
      const attempts = Number(rows[0]?.[0] ?? 0) + 1;
      const dead = shouldMarkDead(attempts, retryable);
      const status = dead ? "dead" : "pending";
      const scheduled = dead ? null : scheduledAtFromAttempts(attempts);
      await run(
        `UPDATE appspresso_outbox SET status = ?, attempts = ?, last_error = ?, scheduled_at = ?, updated_at = ? WHERE id = ?`,
        [status, attempts, error, scheduled, new Date().toISOString(), id],
      );
    },

    async releaseStaleProcessing(leaseMs) {
      const cutoff = new Date(Date.now() - leaseMs).toISOString();
      await run(
        `UPDATE appspresso_outbox SET status = 'pending', updated_at = ?
         WHERE status = 'processing' AND updated_at < ?`,
        [new Date().toISOString(), cutoff],
      );
      return 0;
    },

    async retryJob(id) {
      const now = new Date().toISOString();
      await run(
        `UPDATE appspresso_outbox SET status = 'pending', attempts = 0, last_error = NULL, scheduled_at = NULL, updated_at = ?
         WHERE id = ? AND status IN ('failed','dead')`,
        [now, id],
      );
      const rows = await query("SELECT changes()");
      return Number(rows[0]?.[0] ?? 0) > 0;
    },

    async countByStatus() {
      const base: Record<OutboxStatus, number> = {
        pending: 0,
        processing: 0,
        synced: 0,
        failed: 0,
        dead: 0,
      };
      if (!isSqliteOpen()) return base;
      const rows = await query(
        "SELECT status, COUNT(*) FROM appspresso_outbox GROUP BY status",
      );
      for (const row of rows) {
        const status = String(row[0]) as OutboxStatus;
        if (status in base) base[status] = Number(row[1]);
      }
      return base;
    },

    async list(status, limit = 50) {
      if (!isSqliteOpen()) return [];
      const rows = status
        ? await query(
            `SELECT ${SELECT_COLS} FROM appspresso_outbox WHERE status = ? ORDER BY id DESC LIMIT ?`,
            [status, limit],
          )
        : await query(
            `SELECT ${SELECT_COLS} FROM appspresso_outbox ORDER BY id DESC LIMIT ?`,
            [limit],
          );
      return rows.map(mapRow);
    },

    async clearDevOnly() {
      await run("DELETE FROM appspresso_outbox");
      await run("DELETE FROM appspresso_sync_state WHERE key LIKE 'pull_cursor:%'");
    },
  };
}
