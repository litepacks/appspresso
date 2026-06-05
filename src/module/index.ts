export { defineModule } from "./define-module";
export {
  createModuleRegistry,
  ModuleRegistry,
  type ModuleRegistrySummary,
} from "./registry";
export {
  setActiveModuleRegistry,
  getActiveModuleRegistry,
} from "./active-registry";
export {
  collectModuleRoutes,
  moduleRequiresOnboardingGate,
} from "./merge-routes";
export { collectModuleAppRoutes } from "./merge-app-routes";
export type {
  AppspressoModuleDefinition,
  ResolvedAppspressoModule,
  ModuleContext,
  ModuleRouteContribution,
  ModuleRouteOrder,
} from "./types";
export {
  ModuleConflictError,
  ModuleConfigError,
  ModuleDependencyCycleError,
} from "./errors";
