import { Capacitor } from "@capacitor/core";
import type { AppspressoProviderLayer } from "@/app/RootProviders";

/** Capability tokens plugins declare via `requires`. */
export type PluginCapability =
  | "platform"
  | "platform:web"
  | "platform:native"
  | "auth"
  | "sqlite"
  | "sync";

export type HostCapabilitySnapshot = {
  platform: "web" | "ios" | "android";
  isNative: boolean;
  isWeb: boolean;
  capabilities: Set<PluginCapability>;
};

export function resolveHostCapabilities(
  omit: readonly AppspressoProviderLayer[] = [],
): HostCapabilitySnapshot {
  const skip = new Set(omit);
  const platform = Capacitor.getPlatform();
  const isWeb = platform === "web";
  const isNative = !isWeb;
  const capabilities = new Set<PluginCapability>(["platform", "sync"]);

  if (isWeb) capabilities.add("platform:web");
  if (isNative) capabilities.add("platform:native");
  if (!skip.has("auth")) capabilities.add("auth");
  capabilities.add("sqlite");

  return {
    platform: platform === "ios" || platform === "android" ? platform : "web",
    isNative,
    isWeb,
    capabilities,
  };
}

export function parseCapabilityToken(raw: string): PluginCapability | null {
  const known: PluginCapability[] = [
    "platform",
    "platform:web",
    "platform:native",
    "auth",
    "sqlite",
    "sync",
  ];
  return known.includes(raw as PluginCapability)
    ? (raw as PluginCapability)
    : null;
}
