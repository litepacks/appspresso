import { useEffect, useRef } from "react";
import { onOfflineEnter, onOnlineEnter } from "@/services/offline-mode.service";

export type UseOfflineTransitionOptions = {
  /** When going offline (once) */
  onOffline?: () => void;
  /** When back online (once) */
  onOnline?: () => void;
};

/**
 * Side effects on offline / online **edge** events (toast, retry, query invalidation).
 * Callbacks held in refs; does not re-subscribe every render.
 */
export function useOfflineTransition({
  onOffline,
  onOnline,
}: UseOfflineTransitionOptions): void {
  const offlineRef = useRef(onOffline);
  const onlineRef = useRef(onOnline);
  offlineRef.current = onOffline;
  onlineRef.current = onOnline;

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(
      onOfflineEnter(() => {
        offlineRef.current?.();
      }),
    );
    unsubs.push(
      onOnlineEnter(() => {
        onlineRef.current?.();
      }),
    );
    return () => {
      for (const u of unsubs) u();
    };
  }, []);
}
