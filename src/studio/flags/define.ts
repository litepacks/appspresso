import type { AppspressoFlagsConfig } from "@/studio/flags/schema";
import { appspressoFlagsSchema } from "@/studio/flags/schema";

export function defineAppspressoFlags(
  config: AppspressoFlagsConfig,
): AppspressoFlagsConfig {
  return appspressoFlagsSchema.parse(config);
}

/** Registry defaults as flat boolean map for env merge. */
export function flagsDefaultsToRecord(
  config: AppspressoFlagsConfig,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [key, def] of Object.entries(config)) {
    out[key] = def.default;
  }
  return out;
}

/** Merge order: registry defaults → env/remote (caller supplies env layer). */
export function mergeFeatureFlags(
  registry: AppspressoFlagsConfig,
  envFlags: Record<string, boolean> = {},
): Record<string, boolean> {
  return { ...flagsDefaultsToRecord(registry), ...envFlags };
}
