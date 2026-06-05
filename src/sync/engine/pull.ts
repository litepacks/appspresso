import { applyPullChanges } from "../conflict/apply";
import { appendSyncLog } from "../log";
import type { SyncProvider } from "../provider";
import { SYNC_STATE_KEYS, getSyncState, setSyncState } from "../sync-state";

const DEFAULT_ENTITY = "_all";

export async function runPullPhase(
  provider: SyncProvider,
  entityType = DEFAULT_ENTITY,
): Promise<{ pulled: number; conflicts: number }> {
  if (!provider.pull) {
    return { pulled: 0, conflicts: 0 };
  }

  const cursorKey = SYNC_STATE_KEYS.pullCursor(entityType);
  const cursor = await getSyncState(cursorKey);
  const result = await provider.pull(cursor, {});

  const { applied, conflicts } = await applyPullChanges(result.changes, {
    strategy: "server-wins",
  });

  if (result.cursor != null) {
    await setSyncState(cursorKey, result.cursor);
  }
  await setSyncState(SYNC_STATE_KEYS.lastPullAt, new Date().toISOString());

  appendSyncLog("info", "pull.done", {
    changes: result.changes.length,
    applied,
    conflicts,
  });

  return { pulled: applied, conflicts };
}
