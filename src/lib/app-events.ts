import { reportError } from "@/lib/reportError";

const busTag = "appEvents.listener";

export type AppEventBus<TEvents extends Record<string, unknown>> = {
  on: <K extends keyof TEvents & string>(
    name: K,
    handler: (payload: TEvents[K]) => void,
  ) => () => void;
  emit: <K extends keyof TEvents & string>(
    name: K,
    ...payload: [TEvents[K]] extends [undefined] ? [] : [TEvents[K]]
  ) => void;
  /**
   * Removes all listeners (usually test teardown).
   */
  clear: () => void;
};

/**
 * Lightweight in-app pub/sub — centralized events instead of prop drilling.
 * In production use `AppEventMap` + `createAppEventBus` in `src/app/events.ts`.
 */
export function createAppEventBus<
  TEvents extends Record<string, unknown>,
>(): AppEventBus<TEvents> {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();

  const on: AppEventBus<TEvents>["on"] = (name, handler) => {
    let set = listeners.get(name);
    if (!set) {
      set = new Set();
      listeners.set(name, set);
    }
    const fn = (payload: unknown) => {
      (handler as (p: unknown) => void)(payload);
    };
    set.add(fn);
    return () => {
      set?.delete(fn);
      if (set && set.size === 0) {
        listeners.delete(name);
      }
    };
  };

  const emit: AppEventBus<TEvents>["emit"] = (name, ...args) => {
    const set = listeners.get(name);
    if (!set?.size) {
      return;
    }
    const payload = args.length > 0 ? args[0] : undefined;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (e) {
        reportError(e, { kind: busTag, event: name });
      }
    }
  };

  const clear = () => {
    listeners.clear();
  };

  return { on, emit, clear };
}
