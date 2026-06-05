import { http } from "@/api/http";
import { IDEMPOTENCY_HTTP_HEADER } from "./idempotency";
import type { OutboxJob, PullResult, SyncProvider } from "./provider";
import { createSyncProvider } from "./provider";

export type RestSyncProviderConfig = {
  name?: string;
  pushPath: (job: OutboxJob) => string;
  pullPath?: string;
  mapPushBody?: (job: OutboxJob) => unknown;
  mapPullResponse?: (data: unknown) => PullResult;
};

export function createRestSyncProvider(
  config: RestSyncProviderConfig,
): SyncProvider {
  const name = config.name ?? "rest";

  return createSyncProvider({
    name,
    async push(job) {
      const path = config.pushPath(job);
      const body = config.mapPushBody?.(job) ?? job.payload;
      try {
        const res = await http.post(path, body, {
          headers: { [IDEMPOTENCY_HTTP_HEADER]: job.idempotencyKey },
        });
        const status = res.status ?? 200;
        if (status === 401 || status === 403) {
          return {
            ok: false,
            retryable: false,
            code: "auth",
            message: `HTTP ${status}`,
          };
        }
        if (status === 409) {
          return { ok: true };
        }
        if (status >= 400) {
          return {
            ok: false,
            retryable: status >= 500,
            code: String(status),
            message: `HTTP ${status}`,
          };
        }
        const data = res.data as { remoteId?: string; version?: number };
        return {
          ok: true,
          remoteId: data?.remoteId,
          version: data?.version,
        };
      } catch (e) {
        return {
          ok: false,
          retryable: true,
          code: "network",
          message: e instanceof Error ? e.message : String(e),
        };
      }
    },
    async pull(cursor) {
      if (!config.pullPath) {
        return { cursor: null, changes: [] };
      }
      const res = await http.get(config.pullPath, {
        params: { cursor: cursor ?? undefined },
      });
      return (
        config.mapPullResponse?.(res.data) ?? {
          cursor: null,
          changes: [],
        }
      );
    },
  });
}
