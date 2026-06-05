import { appendSyncLog } from "../log";
import type { OutboxRecord } from "../types";
import type { OutboxStore } from "../outbox/types";
import type { OutboxJob, SyncProvider } from "../provider";
import { SYNC_STATE_KEYS, setSyncState } from "../sync-state";

function toJob(row: OutboxRecord): OutboxJob {
  let payload: unknown;
  try {
    payload = JSON.parse(row.payload);
  } catch {
    payload = {};
  }
  return {
    id: String(row.id),
    idempotencyKey: row.idempotencyKey,
    entityType: row.entityType,
    entityLocalId: row.entityLocalId ?? undefined,
    action: row.action,
    operation: row.operation ?? undefined,
    payload,
    attempts: row.attempts,
  };
}

export async function runPushPhase(
  store: OutboxStore,
  provider: SyncProvider,
  maxJobs = 20,
): Promise<{ pushed: number; authFailure: boolean }> {
  let pushed = 0;
  let authFailure = false;

  for (let i = 0; i < maxJobs; i++) {
    const row = await store.claimNext();
    if (!row) break;

    const job = toJob(row);
    const result = await provider.push(job, {});

    if (result.ok) {
      await store.markSynced(row.id);
      pushed++;
      appendSyncLog("info", "push.ok", {
        id: row.id,
        entityType: row.entityType,
      });
      continue;
    }

    if (result.code === "auth") {
      authFailure = true;
      await store.markFailed(row.id, result.message, false);
      appendSyncLog("warn", "push.auth", { id: row.id });
      break;
    }

    await store.markFailed(row.id, result.message, result.retryable);
    appendSyncLog(result.retryable ? "warn" : "error", "push.fail", {
      id: row.id,
      code: result.code,
      retryable: result.retryable,
    });

    if (!result.retryable) break;
  }

  if (pushed > 0) {
    await setSyncState(SYNC_STATE_KEYS.lastPushAt, new Date().toISOString());
  }

  return { pushed, authFailure };
}
