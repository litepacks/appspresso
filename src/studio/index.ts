export { defineAppspressoRoutes } from "@/studio/routes/define";
export {
  getTabEntriesFromRoutes,
  routesConfigToPreAppObjects,
  routesConfigToRouteObjects,
} from "@/studio/routes/adapter";
export {
  validateAppspressoRoutes,
  type RouteValidationIssue,
  type RouteValidationResult,
} from "@/studio/routes/validate";
export type {
  AppspressoRoutesConfig,
  RouteAccess,
  RouteEntry,
} from "@/studio/routes/schema";
export { appspressoRoutesSchema } from "@/studio/routes/schema";

export {
  defineAppspressoFlags,
  flagsDefaultsToRecord,
  mergeFeatureFlags,
} from "@/studio/flags/define";
export type {
  AppspressoFlagsConfig,
  FlagDefinition,
} from "@/studio/flags/schema";
export { appspressoFlagsSchema } from "@/studio/flags/schema";

export { defineAppspressoTheme } from "@/studio/theme/define";
export type { AppspressoThemeConfig } from "@/studio/theme/schema";
export { appspressoThemeSchema } from "@/studio/theme/schema";

export { defineAppspressoEnvSchema } from "@/studio/env/define";
export type {
  AppspressoEnvSchemaConfig,
  EnvVarDefinition,
} from "@/studio/env/schema";
export { appspressoEnvSchema } from "@/studio/env/schema";

export {
  validateAppspressoAppMeta,
  appspressoAppMetaSchema,
} from "@/build/app-meta.schema";
