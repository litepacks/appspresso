import { z } from "zod";

/** Expected body for remote or `VITE_FEATURE_FLAGS`: flat `Record<string, boolean>`. */
export const featureFlagsRecordSchema = z.record(z.string(), z.boolean());

export type FeatureFlagsRecord = z.infer<typeof featureFlagsRecordSchema>;

/**
 * Parses a JSON string (e.g. `VITE_FEATURE_FLAGS`) into a flag map; `undefined` if invalid.
 */
export function parseFeatureFlagsJson(
  raw: string,
): FeatureFlagsRecord | undefined {
  try {
    const data: unknown = JSON.parse(raw);
    const r = featureFlagsRecordSchema.safeParse(data);
    return r.success ? r.data : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Converts an HTTP response body to a flag record (only `boolean` values kept).
 */
export function parseFeatureFlagsFromResponseBody(
  data: unknown,
): FeatureFlagsRecord | undefined {
  const r = featureFlagsRecordSchema.safeParse(data);
  return r.success ? r.data : undefined;
}

export function resolveFeatureFlag(
  flags: Record<string, boolean>,
  key: string,
  defaultValue = false,
): boolean {
  return key in flags ? flags[key] : defaultValue;
}
