import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getInjectedAppMeta } from "@/build/injected-app-meta";
import { logger } from "@/lib/logger";

const isNative = Capacitor.isNativePlatform();

/** Once: re-hide system bar when it reappears with `hidden: true` */
let statusBarHiddenMaintenanceAttached = false;

function statusBarHiddenFromMeta(): boolean {
  return getInjectedAppMeta()?.statusBar?.hidden === true;
}

async function rehideStatusBar(): Promise<void> {
  if (!isNative || !statusBarHiddenFromMeta()) return;
  try {
    await StatusBar.hide();
  } catch (e) {
    logger.debug("rehideStatusBar", { e: String(e) });
  }
}

/**
 * Android WebView sometimes re-shows status bar after scroll / focus change.
 * Repeat hide when app becomes active again and on visibility change.
 */
async function attachStatusBarHiddenMaintenance(): Promise<void> {
  if (
    !isNative ||
    !statusBarHiddenFromMeta() ||
    statusBarHiddenMaintenanceAttached
  ) {
    return;
  }
  statusBarHiddenMaintenanceAttached = true;
  try {
    const { App } = await import("@capacitor/app");
    await App.addListener("resume", rehideStatusBar);
    await App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void rehideStatusBar();
    });
  } catch (e) {
    logger.debug("attachStatusBarHiddenMaintenance App", { e: String(e) });
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void rehideStatusBar();
  });

  if (Capacitor.getPlatform() === "android") {
    let scrollRehideTimer: number | undefined;
    const scheduleRehideFromScroll = () => {
      if (scrollRehideTimer !== undefined) {
        window.clearTimeout(scrollRehideTimer);
      }
      scrollRehideTimer = window.setTimeout(() => void rehideStatusBar(), 100);
    };
    document.addEventListener("scroll", scheduleRehideFromScroll, true);
  }
}

async function applyStatusBarFromAppMeta(): Promise<void> {
  if (!isNative) return;
  const sb = getInjectedAppMeta()?.statusBar;
  if (sb == null) return;
  try {
    if (sb.overlaysWebView === true) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    } else if (sb.overlaysWebView === false) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
    if (sb.hidden === true) {
      await StatusBar.hide();
      // WebView layout may restore bar one frame later; delayed second hide.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      await StatusBar.hide();
      await attachStatusBarHiddenMaintenance();
    } else if (sb.hidden === false) {
      await StatusBar.show();
    }
  } catch (e) {
    logger.debug("applyStatusBarFromAppMeta", { e: String(e) });
  }
}

export async function initAppearance(
  resolvedTheme: "light" | "dark",
): Promise<void> {
  applySafeAreaClass();
  if (!isNative) return;
  await applyStatusBarFromAppMeta();
  await setStatusBarTheme(resolvedTheme);
}

export async function hideSplashScreen(fadeOutDuration = 450): Promise<void> {
  if (!isNative) return;
  try {
    await SplashScreen.hide({ fadeOutDuration });
  } catch (e) {
    logger.warn("hideSplashScreen", { e: String(e) });
  }
}

export async function setStatusBarTheme(
  theme: "light" | "dark",
): Promise<void> {
  if (!isNative) return;
  if (statusBarHiddenFromMeta()) return;
  try {
    const lightContent = theme === "dark";
    await StatusBar.setStyle({
      style: lightContent ? Style.Dark : Style.Light,
    });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({
        color: theme === "dark" ? "#020617" : "#ffffff",
      });
    }
  } catch (e) {
    logger.debug("setStatusBarTheme", { e: String(e) });
  }
}

export function applySafeAreaClass(): void {
  document.documentElement.classList.add("cap-safe");
}
