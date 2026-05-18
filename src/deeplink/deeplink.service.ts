import { App } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import type { NavigateFunction } from "react-router-dom";
import { handleDeepLink } from "./deeplink.handler";

let initialized = false;
let listener: PluginListenerHandle | undefined;

export async function handleInitialDeepLink(
  navigate: NavigateFunction,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const launch = await App.getLaunchUrl();
    if (launch?.url) handleDeepLink(launch.url, navigate);
  } catch {
    /* no cold start url */
  }
}

export async function handleRuntimeDeepLinks(
  navigate: NavigateFunction,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  listener = await App.addListener("appUrlOpen", ({ url }) => {
    handleDeepLink(url, navigate);
  });
}

export async function initDeepLinks(navigate: NavigateFunction): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  initialized = true;
  await handleInitialDeepLink(navigate);
  await handleRuntimeDeepLinks(navigate);
}

export async function cleanupDeepLinks(): Promise<void> {
  initialized = false;
  await listener?.remove();
  listener = undefined;
}
