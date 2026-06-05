import { Capacitor } from "@capacitor/core";
import { initNetworkListeners } from "@/services/network.service";

let onlineCleanup: (() => void) | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(ms = 400): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void import("@/sync/sync.service").then((m) => m.flushOutbox());
  }, ms);
}

/**
 * Cold-start safe sync wiring (network listeners only on native).
 * SQLite/outbox/engine chunks load later via `flushOutbox` / deferred DB init.
 */
export function initSyncLayer(): void {
  if (Capacitor.getPlatform() === "web") {
    void import("@/sync/sync.service").then((m) => {
      void m.migrateLegacyWebOutboxOnBoot();
    });
  }
  onlineCleanup = initNetworkListeners(() => scheduleFlush(0));
}

export function teardownSyncLayer(): void {
  onlineCleanup?.();
  onlineCleanup = null;
  if (flushTimer) clearTimeout(flushTimer);
}
