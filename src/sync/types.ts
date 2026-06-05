import type { SyncAction } from "./provider";

export type OutboxStatus =
  | "pending"
  | "processing"
  | "synced"
  | "failed"
  | "dead";

export type OutboxRecord = {
  id: number;
  idempotencyKey: string;
  entityType: string;
  entityLocalId?: string | null;
  action: SyncAction;
  operation?: string | null;
  payload: string;
  status: OutboxStatus;
  attempts: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string | null;
  syncedAt?: string | null;
};

/** @deprecated Use `enqueueOutbox` / `enqueueMutationLikeOperation` with entity fields. */
export type OutboxEnqueueInput = {
  operation: string;
  payload: Record<string, unknown>;
  entityType?: string;
  entityLocalId?: string;
  action?: SyncAction;
  idempotencyKey?: string;
};

export type OutboxEnqueueOptions = {
  entityType: string;
  entityLocalId?: string;
  action: SyncAction;
  operation?: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

export const DEFAULT_MAX_OUTBOX_ATTEMPTS = 8;
export const PROCESSING_LEASE_MS = 5 * 60 * 1000;
