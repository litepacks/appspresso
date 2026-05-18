import { z } from "zod";
import { logger } from "@/lib/logger";

const envConfigSchema = z.object({
  apiBaseUrl: z.string().min(1).optional(),
  sentryDsn: z.string().url().optional(),
  enableDebugPanel: z.boolean().optional(),
  gitSha: z.string().optional(),
  revenuecatApiKeyIos: z.string().min(1).optional(),
  revenuecatApiKeyAndroid: z.string().min(1).optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
});

const packageConfigSchema = z.object({
  mount: z.object({
    rootElementId: z.string().min(1),
    strictMode: z.boolean(),
  }),
  storage: z.object({
    keyPrefix: z.string().min(1),
  }),
  http: z.object({
    timeoutMs: z.number().positive(),
  }),
  iap: z.object({
    productIds: z.array(z.string().min(1)),
  }),
  deeplink: z.object({
    scheme: z.string().min(1),
  }),
  splash: z.object({
    backgroundLight: z.string().min(1),
    backgroundDark: z.string().min(1),
  }),
  revenuecat: z.object({
    entitlementId: z.string().min(1),
  }),
  orientation: z.object({
    portraitMaxAspectRatio: z.number().positive(),
  }),
});

export type ValidatedEnvConfig = z.infer<typeof envConfigSchema>;

/**
 * Call before boot or `getAppspressoConfig`; logs and throws if invalid.
 */
export function assertValidEnvConfig(config: ValidatedEnvConfig): void {
  const r = envConfigSchema.safeParse(config);
  if (!r.success) {
    const msg = r.error.flatten();
    logger.error("Appspresso: invalid env configuration", {
      fieldErrors: msg.fieldErrors,
      formErrors: msg.formErrors,
    });
    throw new Error(
      `Appspresso: invalid environment configuration — check VITE_* variables: ${r.error.message}`,
    );
  }
}

export function assertValidPackageConfig(config: unknown): void {
  const r = packageConfigSchema.safeParse(config);
  if (!r.success) {
    const msg = r.error.flatten();
    logger.error("Appspresso: invalid package configuration", {
      fieldErrors: msg.fieldErrors,
    });
    throw new Error(
      `Appspresso: invalid appspresso package config: ${r.error.message}`,
    );
  }
}
