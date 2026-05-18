import { useEffect, useRef } from "react";
import type { AppEventBus } from "@/lib/app-events";

/**
 * Subscribes to event bus; `handler` may change each render (stabilized via ref).
 */
export function useAppEventSubscription<
  TEvents extends Record<string, unknown>,
  K extends keyof TEvents & string,
>(
  bus: AppEventBus<TEvents>,
  name: K,
  handler: (payload: TEvents[K]) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return bus.on(name, (p) => handlerRef.current(p));
  }, [bus, name]);
}
