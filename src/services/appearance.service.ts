import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getInjectedAppMeta } from "@/build/injected-app-meta";
import { bootTrace } from "@/lib/boot-trace";
import { logger } from "@/lib/logger";

/** Once: re-hide system bar when it reappears with `hidden: true` */
let statusBarHiddenMaintenanceAttached = false;

function statusBarHiddenFromMeta(): boolean {
  return getInjectedAppMeta()?.statusBar?.hidden === true;
}

async function rehideStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !statusBarHiddenFromMeta()) return;
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
    !Capacitor.isNativePlatform() ||
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
  if (!Capacitor.isNativePlatform()) return;
  const sb = getInjectedAppMeta()?.statusBar;
  if (sb == null) return;
  bootTrace("appearance.statusBar.start", {
    hidden: sb.hidden,
    overlaysWebView: sb.overlaysWebView,
  });
  try {
    if (sb.overlaysWebView === true) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    } else if (sb.overlaysWebView === false) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
    if (sb.hidden === true) {
      await StatusBar.hide();
      // WebView layout may restore bar one frame later; delayed second hide.
      // Race rAF with a timeout: on a busy WebView (emulator) rAF can be
      // starved, and this must never block the bootstrap critical path.
      await new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        requestAnimationFrame(() => requestAnimationFrame(done));
        setTimeout(done, 250);
      });
      await StatusBar.hide();
      // Maintenance listeners are not on the bootstrap critical path.
      void attachStatusBarHiddenMaintenance();
    } else if (sb.hidden === false) {
      await StatusBar.show();
    }
  } catch (e) {
    bootTrace("appearance.statusBar.error", { e: String(e) });
    logger.debug("applyStatusBarFromAppMeta", { e: String(e) });
  }
  bootTrace("appearance.statusBar.done");
}

export async function initAppearance(
  resolvedTheme: "light" | "dark",
): Promise<void> {
  applySafeAreaClass();
  if (!Capacitor.isNativePlatform()) return;
  await applyStatusBarFromAppMeta();
  await setStatusBarTheme(resolvedTheme);
}

export async function hideSplashScreen(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  bootTrace("appearance.splash.hide.call");
  try {
    await SplashScreen.hide();
    bootTrace("appearance.splash.hide.done");
  } catch (e) {
    bootTrace("appearance.splash.hide.error", { e: String(e) });
    logger.warn("hideSplashScreen", { e: String(e) });
  }
}

export async function setStatusBarTheme(
  theme: "light" | "dark",
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
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
  const root = document.documentElement;
  root.classList.add("cap-safe");
  if (Capacitor.isNativePlatform()) {
    root.classList.add("cap-native");
    root.classList.add(`cap-${Capacitor.getPlatform()}`);
  }
}
