import type { AppspressoRoutesConfig } from "@/studio/routes/schema";
import { appspressoRoutesSchema } from "@/studio/routes/schema";

/** Declarative route graph for Studio and runtime adapters. */
export function defineAppspressoRoutes(
  config: AppspressoRoutesConfig,
): AppspressoRoutesConfig {
  return appspressoRoutesSchema.parse(config);
}
