import { createIdempotencyKey } from "../idempotency";
import type { OutboxEnqueueOptions, OutboxRecord, OutboxStatus } from "../types";
import { shouldMarkDead, scheduledAtFromAttempts } from "./backoff";
import type { OutboxStore } from "./types";

const DB_NAME = "appspresso_outbox";
const STORE = "jobs";
const DB_VERSION = 1;

type IdbRow = OutboxRecord & { payload: string };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        os.createIndex("status", "status", { unique: false });
        os.createIndex("idempotencyKey", "idempotencyKey", { unique: true });
        os.createIndex("scheduledAt", "scheduledAt", { unique: false });
      }
    };
  });
}

function tx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

async function db(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("indexedDB.unavailable");
  }
  dbPromise ??= openDb();
  return dbPromise;
}

export function createWebIdbOutboxStore(): OutboxStore {
  return {
    async enqueue(input) {
      const d = await db();
      const now = new Date().toISOString();
      const key =
        input.idempotencyKey ??
        createIdempotencyKey({
          entityType: input.entityType,
          entityLocalId: input.entityLocalId,
          action: input.action,
          payloadVersion: JSON.stringify(input.payload).length,
        });
      const row: Omit<IdbRow, "id"> = {
        idempotencyKey: key,
        entityType: input.entityType,
        entityLocalId: input.entityLocalId ?? null,
        action: input.action,
        operation: input.operation ?? null,
        payload: JSON.stringify(input.payload),
        status: "pending",
        attempts: 0,
        lastError: null,
        createdAt: now,
        updatedAt: now,
        scheduledAt: null,
        syncedAt: null,
      };
      await tx(d, "readwrite", (s) => s.add(row));
    },

    async claimNext() {
      const d = await db();
      const now = new Date().toISOString();
      const all = await tx<IdbRow[]>(d, "readonly", (s) => s.getAll());
      const next = all
        .filter(
          (r) =>
            r.status === "pending" &&
            (!r.scheduledAt || r.scheduledAt <= now),
        )
        .sort((a, b) => a.id - b.id)[0];
      if (!next) return null;
      next.status = "processing";
      next.updatedAt = now;
      await tx(d, "readwrite", (s) => s.put(next));
      return next;
    },

    async markSynced(id) {
      const d = await db();
      const row = await tx<IdbRow | undefined>(d, "readonly", (s) =>
        s.get(id),
      );
      if (!row) return;
      const now = new Date().toISOString();
      row.status = "synced";
      row.syncedAt = now;
      row.updatedAt = now;
      await tx(d, "readwrite", (s) => s.put(row));
    },

    async markFailed(id, error, retryable) {
      const d = await db();
      const row = await tx<IdbRow | undefined>(d, "readonly", (s) =>
        s.get(id),
      );
      if (!row) return;
      const attempts = row.attempts + 1;
      const dead = shouldMarkDead(attempts, retryable);
      row.attempts = attempts;
      row.lastError = error;
      row.status = dead ? "dead" : "pending";
      row.scheduledAt = dead ? null : scheduledAtFromAttempts(attempts);
      row.updatedAt = new Date().toISOString();
      await tx(d, "readwrite", (s) => s.put(row));
    },

    async releaseStaleProcessing(leaseMs) {
      const d = await db();
      const cutoff = Date.now() - leaseMs;
      const all = await tx<IdbRow[]>(d, "readonly", (s) => s.getAll());
      let n = 0;
      for (const row of all) {
        if (
          row.status === "processing" &&
          new Date(row.updatedAt).getTime() < cutoff
        ) {
          row.status = "pending";
          row.updatedAt = new Date().toISOString();
          await tx(d, "readwrite", (s) => s.put(row));
          n++;
        }
      }
      return n;
    },

    async retryJob(id) {
      const d = await db();
      const row = await tx<IdbRow | undefined>(d, "readonly", (s) =>
        s.get(id),
      );
      if (!row || !["failed", "dead"].includes(row.status)) return false;
      row.status = "pending";
      row.attempts = 0;
      row.lastError = null;
      row.scheduledAt = null;
      row.updatedAt = new Date().toISOString();
      await tx(d, "readwrite", (s) => s.put(row));
      return true;
    },

    async countByStatus() {
      const base: Record<OutboxStatus, number> = {
        pending: 0,
        processing: 0,
        synced: 0,
        failed: 0,
        dead: 0,
      };
      const d = await db();
      const all = await tx<IdbRow[]>(d, "readonly", (s) => s.getAll());
      for (const row of all) {
        if (row.status in base) base[row.status]++;
      }
      return base;
    },

    async list(status, limit = 50) {
      const d = await db();
      const all = await tx<IdbRow[]>(d, "readonly", (s) => s.getAll());
      const filtered = status
        ? all.filter((r) => r.status === status)
        : all;
      return filtered
        .sort((a, b) => b.id - a.id)
        .slice(0, limit);
    },

    async clearDevOnly() {
      const d = await db();
      await tx(d, "readwrite", (s) => s.clear());
    },
  };
}
