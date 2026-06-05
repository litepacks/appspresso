import { authModule } from "@appspresso/module-auth";
import { notificationsModule } from "@appspresso/module-notifications";
import { onboardingModule } from "@appspresso/module-onboarding";
import { settingsModule } from "@appspresso/module-settings";
import { subscriptionsModule } from "@appspresso/module-subscriptions";
import { createModuleRegistry } from "@/module";
import { showcaseAppRoutes } from "@/showcase-app-routes";
import {
  createAppspressoBrowserRouter,
  type AppspressoRouterOptions,
} from "@/app/router";

export const showcaseModules = [
  onboardingModule(),
  authModule({ enableRegister: true, enableForgotPassword: true }),
  settingsModule({ showDebugSection: import.meta.env.DEV }),
  notificationsModule(),
  subscriptionsModule(),
] as const;

export const showcaseModuleRegistry = createModuleRegistry(showcaseModules);

export function createShowcaseRouter(
  options?: Omit<AppspressoRouterOptions, "modules" | "appRoutes" | "legacyShowcase">,
) {
  return createAppspressoBrowserRouter({
    ...options,
    modules: showcaseModuleRegistry,
    appRoutes: showcaseAppRoutes,
    legacyShowcase: false,
  });
}
