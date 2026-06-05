import type { OutboxEnqueueOptions, OutboxRecord, OutboxStatus } from "../types";
import type { PushResult } from "../provider";

export type OutboxStore = {
  enqueue(input: OutboxEnqueueOptions): Promise<void>;
  claimNext(): Promise<OutboxRecord | null>;
  markSynced(id: number): Promise<void>;
  markFailed(id: number, error: string, retryable: boolean): Promise<void>;
  releaseStaleProcessing(leaseMs: number): Promise<number>;
  retryJob(id: number): Promise<boolean>;
  countByStatus(): Promise<Record<OutboxStatus, number>>;
  list(status?: OutboxStatus, limit?: number): Promise<OutboxRecord[]>;
  clearDevOnly(): Promise<void>;
};

export type { PushResult, OutboxRecord, OutboxEnqueueOptions, OutboxStatus };
