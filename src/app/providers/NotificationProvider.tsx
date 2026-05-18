import { type ReactNode, useEffect } from "react";
import { initNotificationBridge } from "@/services/init-notifications.service";

/**
 * Subscribes to Capacitor push listener bridge when `StoreProvider` is present
 * (listeners write to Jotai `appStore`). No-op on web.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => Promise<void>) | undefined;

    void (async () => {
      const d = await initNotificationBridge();
      if (cancelled) {
        await d();
        return;
      }
      dispose = d;
    })();

    return () => {
      cancelled = true;
      void dispose?.();
    };
  }, []);

  return <>{children}</>;
}
