import { createAppEventBus } from "@/lib/app-events";

/**
 * App-wide event dictionary — add keys here and use via `appEvents.emit` / `useAppEventSubscription`.
 */
export type AppEventMap = {
  /** Example: trigger settings flow (placeholder; remove and add your own events) */
  "app:open-settings": undefined;
};

export const appEvents = createAppEventBus<AppEventMap>();
