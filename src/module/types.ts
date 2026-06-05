import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import type { z } from "zod";
import type { AppEventMap } from "@/app/events";
import type { AppspressoPackageConfig } from "@/config/appspresso.config";
import type { ValidatedEnvConfig } from "@/config/validate";
import type { RouteTreeEntry } from "@/app/route-tree";
import type { DbMigration } from "@/db/migrations/index";
import type { I18nJsonBundles } from "@/i18n";
import type { AppEventBus } from "@/lib/app-events";
import type { logger } from "@/lib/logger";
import type { SqliteSlice, SyncSlice } from "@/state/atoms";
import type { PluginContext } from "@/plugin/types";

export type ModuleRouteOrder = "pre-app" | "app" | "post-app";

export type ModuleRouteContribution = {
  basePath?: string;
  routes: RouteObject[];
  layout?: RouteObject;
  order?: ModuleRouteOrder;
  /** When true, app routes render inside OnboardingGate (module-onboarding). */
  requiresOnboardingGate?: boolean;
};

export type ModulePlatformInfo = {
  os: "ios" | "android" | "web";
  isNative: boolean;
  isWeb: boolean;
};

export type ModuleContext = {
  readonly platform: ModulePlatformInfo;
  readonly logger: Pick<typeof logger, "debug" | "info" | "warn" | "error">;
  readonly env: ValidatedEnvConfig;
  readonly config: { package: AppspressoPackageConfig };
  readonly events: AppEventBus<AppEventMap>;
  readonly auth?: PluginContext["auth"];
  readonly featureFlags: () => Readonly<Record<string, boolean>>;
  readonly sqlite: () => Readonly<SqliteSlice>;
  readonly sync: () => Readonly<SyncSlice>;
  mergeI18n(bundles: I18nJsonBundles): void;
  mergeFeatureFlags(flags: Record<string, boolean>): void;
};

export type ModuleLifecycleHooks<TConfig = unknown> = {
  setup?: (ctx: ModuleContext, config: TConfig) => void | Promise<void>;
  onBootstrap?: (ctx: ModuleContext, config: TConfig) => void | Promise<void>;
  providers?: (ctx: ModuleContext, config: TConfig, children: ReactNode) => ReactNode;
  dispose?: (ctx: ModuleContext, config: TConfig) => void | Promise<void>;
};

export type AppspressoModuleDefinition<TConfig = unknown> = {
  name: string;
  version?: string;
  configSchema?: z.ZodType<TConfig>;
  suggestsPlugins?: readonly string[];
  after?: readonly string[];
  conflicts?: readonly string[];
  platforms?: readonly ("web" | "native")[];
  routes?: (config: TConfig) => ModuleRouteContribution;
  appRoutes?: (config: TConfig) => readonly RouteTreeEntry[];
  migrations?: readonly DbMigration[];
  i18n?: I18nJsonBundles;
  themeTokens?: Record<string, string>;
} & ModuleLifecycleHooks<TConfig>;

export type ResolvedAppspressoModule<TConfig = unknown> = {
  name: string;
  version?: string;
  config: TConfig;
  suggestsPlugins: readonly string[];
  after: readonly string[];
  conflicts: readonly string[];
  platforms: readonly ("web" | "native")[];
  routes?: (config: TConfig) => ModuleRouteContribution;
  appRoutes?: (config: TConfig) => readonly RouteTreeEntry[];
  migrations?: readonly DbMigration[];
  i18n?: I18nJsonBundles;
  themeTokens?: Record<string, string>;
} & ModuleLifecycleHooks<TConfig>;
