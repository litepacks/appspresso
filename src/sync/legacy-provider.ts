import { http } from "@/api/http";
import { IDEMPOTENCY_HTTP_HEADER } from "./idempotency";
import type { OutboxJob, PushResult, SyncProvider } from "./provider";
import { createSyncProvider } from "./provider";

async function legacyPush(
  job: OutboxJob,
  _ctx: { signal?: AbortSignal },
): Promise<PushResult> {
  const body = job.payload as Record<string, unknown>;
  const path = typeof body.path === "string" ? body.path : "/api/dummy";
  try {
    const res = await http.post(path, body, {
      timeout: 5000,
      validateStatus: () => true,
      headers: { [IDEMPOTENCY_HTTP_HEADER]: job.idempotencyKey },
    });
    const status = res.status ?? 0;
    if (status === 401 || status === 403) {
      return {
        ok: false,
        retryable: false,
        code: "auth",
        message: `HTTP ${status}`,
      };
    }
    if (status === 409) {
      return { ok: true, remoteId: body.remoteId as string | undefined };
    }
    if (status >= 400 && status < 500) {
      return {
        ok: false,
        retryable: false,
        code: String(status),
        message: `HTTP ${status}`,
      };
    }
    if (status >= 500) {
      return {
        ok: false,
        retryable: true,
        code: String(status),
        message: `HTTP ${status}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      retryable: true,
      code: "network",
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

export function createLegacyHttpSyncProvider(): SyncProvider {
  return createSyncProvider({
    name: "legacy-http",
    push: legacyPush,
  });
}
