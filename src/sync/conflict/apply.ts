import type { ConflictStrategy, PullChange } from "../provider";
import { logConflict } from "../conflicts";

export type ApplyPullOptions = {
  strategy?: ConflictStrategy;
  getLocal?: (change: PullChange) => Promise<unknown | null>;
  applyRemote?: (change: PullChange) => Promise<void>;
  applyTombstone?: (change: PullChange) => Promise<void>;
};

/** Default pull applier: server-wins; tombstones when deletedAt is set. */
export async function applyPullChanges(
  changes: PullChange[],
  options: ApplyPullOptions = {},
): Promise<{ applied: number; conflicts: number }> {
  const strategy = options.strategy ?? "server-wins";
  let applied = 0;
  let conflicts = 0;

  for (const change of changes) {
    try {
      if (change.deletedAt) {
        await options.applyTombstone?.(change);
        applied++;
        continue;
      }

      const local = options.getLocal
        ? await options.getLocal(change)
        : null;

      if (local == null) {
        await options.applyRemote?.(change);
        applied++;
        continue;
      }

      if (strategy === "server-wins") {
        await options.applyRemote?.(change);
        applied++;
        continue;
      }

      if (strategy === "last-write-wins") {
        const localUpdated =
          (local as { updated_at?: string })?.updated_at ?? "";
        if (localUpdated >= change.updatedAt) {
          continue;
        }
        await options.applyRemote?.(change);
        applied++;
        continue;
      }

      await logConflict({
        entityType: change.entityType,
        entityLocalId: change.remoteId,
        remoteId: change.remoteId,
        strategy,
        local,
        remote: change.data,
      });
      conflicts++;
    } catch {
      /* partial failure: skip change, continue batch */
    }
  }

  return { applied, conflicts };
}
