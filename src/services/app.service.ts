import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { Capacitor } from "@capacitor/core";
import {
  clearHardwareBackHandlers,
  dispatchHardwareBack,
} from "@/lib/hardware-back";
import { logger } from "@/lib/logger";
import { appLifecycleAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const handles: PluginListenerHandle[] = [];

export async function initAppLifecycle(): Promise<void> {
  await teardownAppLifecycle();
  if (!Capacitor.isNativePlatform()) {
    const sync = () =>
      appStore.set(appLifecycleAtom, {
        state: document.hidden ? "background" : "active",
        isActive: !document.hidden,
        source: "web",
      });
    document.addEventListener("visibilitychange", sync);
    sync();
    handles.push({
      remove: async () => {
        document.removeEventListener("visibilitychange", sync);
      },
    });
    return;
  }

  handles.push(
    await App.addListener("appStateChange", ({ isActive }) => {
      appStore.set(appLifecycleAtom, {
        state: isActive ? "active" : "background",
        isActive,
        source: "native",
      });
    }),
  );

  if (Capacitor.getPlatform() === "android") {
    handles.push(
      await App.addListener("backButton", (event) => {
        if (dispatchHardwareBack(event)) return;
        if (event.canGoBack) {
          window.history.back();
        } else {
          void App.minimizeApp();
        }
      }),
    );
  }
}

export async function teardownAppLifecycle(): Promise<void> {
  clearHardwareBackHandlers();
  for (const h of handles) {
    try {
      await h.remove();
    } catch (e) {
      logger.debug("teardownAppLifecycle", { e: String(e) });
    }
  }
  handles.length = 0;
}
