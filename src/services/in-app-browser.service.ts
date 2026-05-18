import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/logger";

export type InAppBrowserInternalMode = "webview" | "system";

export type OpenInAppBrowserInternalOptions = {
  /** `webview` = in-app WebView; `system` = Custom Tabs / SFSafariViewController. */
  mode?: InAppBrowserInternalMode;
  webViewOptions?: import("@capacitor/inappbrowser").WebViewOptions;
  systemBrowserOptions?: import("@capacitor/inappbrowser").SystemBrowserOptions;
  customHeaders?: Record<string, string>;
};

export function normalizeInAppBrowserUrl(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("URL must start with http:// or https://");
  }
  return trimmed;
}

function openUrlWebFallback(url: string): void {
  if (typeof window === "undefined") {
    throw new Error("Browser is not available in this environment.");
  }
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}

let pluginChecked = false;
let pluginAvailable = false;

/** Whether `@capacitor/inappbrowser` is loaded on native; always true on web (plugin or `window.open`). */
export async function isInAppBrowserAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  if (pluginChecked) return pluginAvailable;
  pluginChecked = true;
  try {
    const mod = await import("@capacitor/inappbrowser");
    pluginAvailable = Boolean(mod.InAppBrowser);
  } catch {
    pluginAvailable = false;
    logger.debug("InAppBrowser plugin not available");
  }
  return pluginAvailable;
}

async function loadInAppBrowserPlugin() {
  const mod = await import("@capacitor/inappbrowser");
  return mod.InAppBrowser;
}

/** Opens in device default browser. */
export async function openInAppBrowserExternal(url: string): Promise<void> {
  const normalized = normalizeInAppBrowserUrl(url);
  if (Capacitor.isNativePlatform() && !(await isInAppBrowserAvailable())) {
    throw new Error(
      "InAppBrowser is unavailable — install @capacitor/inappbrowser and run cap sync.",
    );
  }
  try {
    const InAppBrowser = await loadInAppBrowserPlugin();
    await InAppBrowser.openInExternalBrowser({ url: normalized });
  } catch (e) {
    if (Capacitor.isNativePlatform()) throw e;
    openUrlWebFallback(normalized);
  }
}

/** In-app: WebView or system browser (Custom Tabs / Safari VC). */
export async function openInAppBrowserInternal(
  url: string,
  options?: OpenInAppBrowserInternalOptions,
): Promise<void> {
  const normalized = normalizeInAppBrowserUrl(url);
  const mode = options?.mode ?? "webview";

  if (Capacitor.isNativePlatform() && !(await isInAppBrowserAvailable())) {
    throw new Error(
      "InAppBrowser is unavailable — install @capacitor/inappbrowser and run cap sync.",
    );
  }

  const { InAppBrowser, DefaultWebViewOptions, DefaultSystemBrowserOptions } =
    await import("@capacitor/inappbrowser");

  try {
    if (mode === "system") {
      await InAppBrowser.openInSystemBrowser({
        url: normalized,
        options: options?.systemBrowserOptions ?? DefaultSystemBrowserOptions,
      });
    } else {
      await InAppBrowser.openInWebView({
        url: normalized,
        options: options?.webViewOptions ?? DefaultWebViewOptions,
        customHeaders: options?.customHeaders,
      });
    }
  } catch (e) {
    if (Capacitor.isNativePlatform()) throw e;
    openUrlWebFallback(normalized);
  }
}

/** Closes view opened via `openInWebView` / `openInSystemBrowser`. */
export async function closeInAppBrowser(): Promise<void> {
  if (!(await isInAppBrowserAvailable())) return;
  try {
    const InAppBrowser = await loadInAppBrowserPlugin();
    await InAppBrowser.close();
  } catch (e) {
    logger.warn("closeInAppBrowser", { e: String(e) });
  }
}
