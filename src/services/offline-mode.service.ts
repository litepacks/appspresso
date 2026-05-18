import { logger } from "@/lib/logger";
import type { NetworkSlice } from "@/state/atoms";

const offlineEnterListeners = new Set<() => void>();
const onlineEnterListeners = new Set<() => void>();
const connectivityListeners = new Set<(slice: NetworkSlice) => void>();

function runListeners(set: Set<() => void>, label: string) {
  for (const fn of set) {
    try {
      fn();
    } catch (e) {
      logger.warn(`offline-mode:${label}`, { e: String(e) });
    }
  }
}

/**
 * Called after network atom updates: online/offline **edge** triggers and general listeners.
 * @internal — used directly from `network.service`.
 */
export function notifyConnectivityChange(
  previous: NetworkSlice,
  next: NetworkSlice,
): void {
  for (const fn of connectivityListeners) {
    try {
      fn(next);
    } catch (e) {
      logger.warn("offline-mode:connectivity", { e: String(e) });
    }
  }

  if (previous.connected === next.connected) {
    return;
  }
  if (!next.connected) {
    runListeners(offlineEnterListeners, "offline-enter");
  } else {
    runListeners(onlineEnterListeners, "online-enter");
  }
}

/** Called when going offline (transition only). */
export function onOfflineEnter(listener: () => void): () => void {
  offlineEnterListeners.add(listener);
  return () => {
    offlineEnterListeners.delete(listener);
  };
}

/** Called when back online (transition only). */
export function onOnlineEnter(listener: () => void): () => void {
  onlineEnterListeners.add(listener);
  return () => {
    onlineEnterListeners.delete(listener);
  };
}

/**
 * On every connectivity change (type or `connected`).
 * Suitable for toast, banner, or telemetry.
 */
export function onConnectivityChange(
  listener: (slice: NetworkSlice) => void,
): () => void {
  connectivityListeners.add(listener);
  return () => {
    connectivityListeners.delete(listener);
  };
}
