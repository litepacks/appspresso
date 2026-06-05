import type { z } from "zod";
import { ModuleConfigError } from "./errors";
import type {
  AppspressoModuleDefinition,
  ResolvedAppspressoModule,
} from "./types";

function normalizeDefinition<TConfig>(
  definition: AppspressoModuleDefinition<TConfig>,
): Omit<ResolvedAppspressoModule<TConfig>, "config"> {
  return {
    name: definition.name,
    version: definition.version,
    suggestsPlugins: definition.suggestsPlugins ?? [],
    after: definition.after ?? [],
    conflicts: definition.conflicts ?? [],
    platforms: definition.platforms ?? ["web", "native"],
    routes: definition.routes,
    appRoutes: definition.appRoutes,
    migrations: definition.migrations,
    i18n: definition.i18n,
    themeTokens: definition.themeTokens,
    setup: definition.setup,
    onBootstrap: definition.onBootstrap,
    providers: definition.providers,
    dispose: definition.dispose,
  };
}

function createFactory<TConfig>(
  definition: AppspressoModuleDefinition<TConfig>,
) {
  const base = normalizeDefinition(definition);
  return (config?: TConfig): ResolvedAppspressoModule<TConfig> => {
    let parsed = config as TConfig;
    if (definition.configSchema) {
      const result = definition.configSchema.safeParse(config ?? {});
      if (!result.success) {
        throw new ModuleConfigError(definition.name, result.error.message);
      }
      parsed = result.data;
    }
    return { ...base, config: parsed };
  };
}

export function defineModule<S extends z.ZodTypeAny>(
  definition: AppspressoModuleDefinition<z.infer<S>> & {
    configSchema: S;
  },
): (config: z.infer<S>) => ResolvedAppspressoModule<z.infer<S>>;

export function defineModule(
  definition: AppspressoModuleDefinition<void>,
): () => ResolvedAppspressoModule<void>;

export function defineModule<TConfig>(
  definition: AppspressoModuleDefinition<TConfig>,
):
  | ((config: TConfig) => ResolvedAppspressoModule<TConfig>)
  | (() => ResolvedAppspressoModule<void>) {
  if (definition.configSchema) {
    return createFactory(definition) as (
      config: TConfig,
    ) => ResolvedAppspressoModule<TConfig>;
  }
  const factory = createFactory(definition);
  return (() => factory(undefined as TConfig)) as () => ResolvedAppspressoModule<void>;
}
