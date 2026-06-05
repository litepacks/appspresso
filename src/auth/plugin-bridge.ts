import type { AuthListener, AuthSnapshot } from "@/auth/adapter";

let snapshot: AuthSnapshot = { user: null, status: "loading" };
const listeners = new Set<AuthListener>();

/** @internal Updated by `AuthProvider` for plugin context. */
export function setAuthPluginSnapshot(next: AuthSnapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener(next);
  }
}

export function getAuthPluginSnapshot(): AuthSnapshot {
  return snapshot;
}

export function subscribeAuthPluginSnapshot(
  listener: AuthListener,
): () => void {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

/** @internal Test helper */
export function resetAuthPluginBridge(): void {
  snapshot = { user: null, status: "loading" };
  listeners.clear();
}
