export type SyncAction = "create" | "update" | "delete" | "custom";

export type OutboxJob = {
  id: string;
  idempotencyKey: string;
  entityType: string;
  entityLocalId?: string;
  action: SyncAction;
  operation?: string;
  payload: unknown;
  attempts: number;
};

export type PushResult =
  | { ok: true; remoteId?: string; version?: number }
  | { ok: false; retryable: boolean; code: string; message: string };

export type PullChange = {
  entityType: string;
  remoteId: string;
  version: number;
  updatedAt: string;
  deletedAt?: string | null;
  data: unknown;
};

export type PullResult = {
  cursor: string | null;
  changes: PullChange[];
};

export type ConflictStrategy =
  | "last-write-wins"
  | "server-wins"
  | "client-wins"
  | "merge"
  | "custom";

export type ConflictContext = {
  entityType: string;
  local: unknown;
  remote: unknown;
  strategy: ConflictStrategy;
};

export type ConflictResolution = { resolution: unknown };

export type SyncProvider = {
  name: string;
  push: (
    job: OutboxJob,
    ctx: { signal?: AbortSignal },
  ) => Promise<PushResult>;
  pull?: (
    cursor: string | null,
    ctx: { signal?: AbortSignal },
  ) => Promise<PullResult>;
  resolveConflict?: (
    ctx: ConflictContext,
  ) => Promise<ConflictResolution>;
};

export function createSyncProvider(config: {
  name: string;
  push: SyncProvider["push"];
  pull?: SyncProvider["pull"];
  resolveConflict?: SyncProvider["resolveConflict"];
}): SyncProvider {
  return {
    name: config.name,
    push: config.push,
    pull: config.pull,
    resolveConflict: config.resolveConflict,
  };
}
