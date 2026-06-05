import type { AppspressoThemeConfig } from "@/studio/theme/schema";
import { appspressoThemeSchema } from "@/studio/theme/schema";

export function defineAppspressoTheme(
  config: AppspressoThemeConfig,
): AppspressoThemeConfig {
  return appspressoThemeSchema.parse(config);
}
