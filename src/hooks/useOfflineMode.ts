import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { initNetworkListeners } from "@/services/network.service";
import { offlineModeAtom } from "@/state/atoms";

export type { OfflineModeSlice } from "@/state/atoms";

/**
 * Offline mode summary (`isOffline`, `connectionType`) and network listener setup.
 * For read-only use `offlineModeAtom` + `useAtomValue`; listeners elsewhere
 * (e.g. `useNetworkStatus`) duplicate setup is harmless.
 */
export function useOfflineMode() {
  const slice = useAtomValue(offlineModeAtom);
  useEffect(() => {
    return initNetworkListeners();
  }, []);
  return slice;
}
