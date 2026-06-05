export {
  createSyncProvider,
  type SyncProvider,
  type SyncAction,
  type OutboxJob,
  type PushResult,
  type PullResult,
  type PullChange,
  type ConflictStrategy,
  type ConflictContext,
} from "./provider";
export { registerSyncProvider, getSyncProvider, clearSyncProvider } from "./registry";
export { createRestSyncProvider } from "./rest-provider";
export { createLegacyHttpSyncProvider } from "./legacy-provider";
export {
  enqueueMutationLikeOperation,
  enqueueOutbox,
  flushOutbox,
  flushNativePendingBuffer,
  clearWebOutbox,
} from "./sync.service";
export { initSyncLayer, teardownSyncLayer } from "./sync-lifecycle";
export {
  syncEngineRunOnce,
  syncEnginePullOnly,
  resumeSyncAfterAuth,
} from "./engine";
export { enqueueEntityMutation } from "./repository";
export type { EntitySyncMeta, EntitySyncStatus } from "./entity-meta";
export { createIdempotencyKey, IDEMPOTENCY_HTTP_HEADER } from "./idempotency";
export { retryOutboxJob, listOutboxJobs, getOutboxCounts } from "./outbox/api";
export { getSyncLogs, clearSyncLogs, computeSyncHealthScore } from "./log";
export { listUnresolvedConflicts, logConflict } from "./conflicts";
export { applyPullChanges } from "./conflict/apply";
