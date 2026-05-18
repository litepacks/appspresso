import type { BackButtonListenerEvent } from "@capacitor/app";

export type HardwareBackEvent = Pick<BackButtonListenerEvent, "canGoBack">;

/** When `true`, default back (history / minimize) does not run. */
export type HardwareBackHandler = (
  event: HardwareBackEvent,
) => boolean | undefined;

const handlers: HardwareBackHandler[] = [];

export function registerHardwareBackHandler(
  handler: HardwareBackHandler,
): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
  };
}

export function dispatchHardwareBack(event: HardwareBackEvent): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i](event) === true) return true;
  }
  return false;
}

/** Called during `initAppLifecycle` teardown. */
export function clearHardwareBackHandlers(): void {
  handlers.length = 0;
}
