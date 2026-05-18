import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { logger } from "@/lib/logger";
import { notifyConnectivityChange } from "@/services/offline-mode.service";
import { type NetworkSlice, networkStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

function applyNetworkStatus(next: NetworkSlice): void {
  const previous = appStore.get(networkStatusAtom);
  appStore.set(networkStatusAtom, next);
  notifyConnectivityChange(previous, next);
}

export async function refreshNetworkStatus(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    applyNetworkStatus({
      connected: typeof navigator !== "undefined" ? navigator.onLine : true,
      connectionType: "web",
    });
    return;
  }
  try {
    const status = await Network.getStatus();
    applyNetworkStatus({
      connected: status.connected,
      connectionType: status.connectionType,
    });
  } catch (e) {
    logger.warn("refreshNetworkStatus", { e: String(e) });
  }
}

export function initNetworkListeners(onOnline?: () => void): () => void {
  if (!Capacitor.isNativePlatform()) {
    const online = () => {
      applyNetworkStatus({
        connected: navigator.onLine,
        connectionType: "web",
      });
      if (navigator.onLine) onOnline?.();
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    online();
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }
  const id = Network.addListener("networkStatusChange", (s) => {
    applyNetworkStatus({
      connected: s.connected,
      connectionType: s.connectionType,
    });
    if (s.connected) onOnline?.();
  });
  void refreshNetworkStatus();
  return () => {
    void id.then((h) => h.remove());
  };
}
