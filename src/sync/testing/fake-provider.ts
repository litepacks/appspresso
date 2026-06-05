import type {
  OutboxJob,
  PullChange,
  PullResult,
  PushResult,
  SyncProvider,
} from "../provider";
import { createSyncProvider } from "../provider";

export type FakeSyncProviderOptions = {
  name?: string;
  pushHandler?: (job: OutboxJob) => PushResult | Promise<PushResult>;
  pullHandler?: (cursor: string | null) => PullResult | Promise<PullResult>;
  pullChanges?: PullChange[];
};

export function createFakeSyncProvider(
  options: FakeSyncProviderOptions = {},
): SyncProvider & {
  pushCalls: OutboxJob[];
  pullCalls: string[];
} {
  const pushCalls: OutboxJob[] = [];
  const pullCalls: string[] = [];

  const provider = createSyncProvider({
    name: options.name ?? "fake",
    async push(job) {
      pushCalls.push(job);
      if (options.pushHandler) return options.pushHandler(job);
      return { ok: true, remoteId: `remote-${job.id}` };
    },
    async pull(cursor) {
      pullCalls.push(cursor ?? "");
      if (options.pullHandler) return options.pullHandler(cursor);
      return {
        cursor: "end",
        changes: options.pullChanges ?? [],
      };
    },
  });

  return Object.assign(provider, { pushCalls, pullCalls });
}
