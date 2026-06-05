import type { ReactNode } from "react";
import type { z } from "zod";
import type { AppEventMap } from "@/app/events";
import type { AuthSnapshot } from "@/auth/adapter";
import type { AppspressoPackageConfig } from "@/config/appspresso.config";
import type { ValidatedEnvConfig } from "@/config/validate";
import type { I18nJsonBundles } from "@/i18n";
import type { AppEventBus } from "@/lib/app-events";
import type { logger } from "@/lib/logger";
import type { SqliteSlice, SyncSlice } from "@/state/atoms";
import type { PluginCapability } from "./capabilities";

export type ErrorReporter = (
  error: unknown,
  context?: Record<string, unknown>,
) => void;

export type AnalyticsSink = {
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify?: (userId: string, traits?: Record<string, unknown>) => void;
  reset?: () => void;
};

export type PluginPlatformInfo = {
  os: "ios" | "android" | "web";
  isNative: boolean;
  isWeb: boolean;
};

/** Stable facade passed to plugin lifecycle hooks. */
export type PluginContext = {
  readonly platform: PluginPlatformInfo;
  readonly logger: Pick<typeof logger, "debug" | "info" | "warn" | "error">;
  readonly env: ValidatedEnvConfig;
  readonly config: { package: AppspressoPackageConfig };
  readonly events: AppEventBus<AppEventMap>;
  readonly auth?: {
    getSnapshot(): AuthSnapshot;
    onChange(cb: (snapshot: AuthSnapshot) => void): () => void;
  };
  readonly featureFlags: () => Readonly<Record<string, boolean>>;
  readonly sqlite: () => Readonly<SqliteSlice>;
  readonly sync: () => Readonly<SyncSlice>;
  registerErrorReporter(reporter: ErrorReporter): () => void;
  registerAnalytics(sink: AnalyticsSink): () => void;
  mergeFeatureFlags(flags: Record<string, boolean>): void;
  mergeI18n(bundles: I18nJsonBundles): void;
};

export type PluginLifecycleHooks<TConfig = unknown> = {
  setup?: (ctx: PluginContext, config: TConfig) => void | Promise<void>;
  onBootstrap?: (ctx: PluginContext, config: TConfig) => void | Promise<void>;
  extendProviders?: (ctx: PluginContext, children: ReactNode) => ReactNode;
  onAppReady?: (ctx: PluginContext, config: TConfig) => void | Promise<void>;
  dispose?: (ctx: PluginContext, config: TConfig) => void | Promise<void>;
};

export type AppspressoPluginDefinition<TConfig = void> = {
  name: string;
  version?: string;
  configSchema?: z.ZodType<TConfig>;
  requires?: readonly PluginCapability[];
  /** Run after these plugin `name` values (must be in the host plugin list). */
  after?: readonly string[];
  conflicts?: readonly string[];
  optionalPeers?: readonly string[];
  platforms?: readonly ("web" | "native")[];
} & PluginLifecycleHooks<TConfig>;

/** Resolved plugin instance returned from a `definePlugin` factory. */
export type ResolvedAppspressoPlugin<TConfig = unknown> = {
  name: string;
  version?: string;
  config: TConfig;
  requires: readonly PluginCapability[];
  after: readonly string[];
  conflicts: readonly string[];
  optionalPeers: readonly string[];
  platforms: readonly ("web" | "native")[];
} & PluginLifecycleHooks<TConfig>;
