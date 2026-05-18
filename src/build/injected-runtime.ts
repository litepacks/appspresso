import type { AppspressoAppMeta } from "@/build/app-meta";
import {
  getInjectedHostConfig,
  type AppspressoViteHostConfig,
} from "@/build/inject-env";
import { getInjectedAppMeta } from "@/build/injected-app-meta";

export type AppspressoInjectedConfig = {
  host: AppspressoViteHostConfig;
  app: AppspressoAppMeta | null;
};

/**
 * Host `main.tsx` entry: Vite-injected host shell + app meta from `appspresso.config.ts`.
 */
export function getAppspressoInjectedConfig(): AppspressoInjectedConfig {
  return {
    host: getInjectedHostConfig(),
    app: getInjectedAppMeta(),
  };
}

export { getInjectedHostConfig, getInjectedAppMeta };
export type { AppspressoViteHostConfig } from "@/build/inject-env";
