import type { AppspressoEnvSchemaConfig } from "@/studio/env/schema";
import { appspressoEnvSchema } from "@/studio/env/schema";

export function defineAppspressoEnvSchema(
  config: AppspressoEnvSchemaConfig,
): AppspressoEnvSchemaConfig {
  return appspressoEnvSchema.parse(config);
}
