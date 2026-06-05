import type { z } from "zod";
import { PluginConfigError } from "./errors";
import type {
  AppspressoPluginDefinition,
  ResolvedAppspressoPlugin,
} from "./types";

function normalizeDefinition<TConfig>(
  definition: AppspressoPluginDefinition<TConfig>,
): Omit<ResolvedAppspressoPlugin<TConfig>, "config"> {
  return {
    name: definition.name,
    version: definition.version,
    requires: definition.requires ?? [],
    after: definition.after ?? [],
    conflicts: definition.conflicts ?? [],
    optionalPeers: definition.optionalPeers ?? [],
    platforms: definition.platforms ?? ["web", "native"],
    setup: definition.setup,
    onBootstrap: definition.onBootstrap,
    extendProviders: definition.extendProviders,
    onAppReady: definition.onAppReady,
    dispose: definition.dispose,
  };
}

function createFactory<TConfig>(
  definition: AppspressoPluginDefinition<TConfig>,
) {
  const base = normalizeDefinition(definition);
  return (config?: TConfig): ResolvedAppspressoPlugin<TConfig> => {
    let parsed = config as TConfig;
    if (definition.configSchema) {
      const result = definition.configSchema.safeParse(config);
      if (!result.success) {
        throw new PluginConfigError(definition.name, result.error.message);
      }
      parsed = result.data;
    }
    return { ...base, config: parsed };
  };
}

/**
 * Define an Appspresso runtime plugin. Returns a factory that validates config (when `configSchema` is set).
 */
export function definePlugin<S extends z.ZodTypeAny>(
  definition: AppspressoPluginDefinition<z.infer<S>> & {
    configSchema: S;
  },
): (config: z.infer<S>) => ResolvedAppspressoPlugin<z.infer<S>>;

export function definePlugin(
  definition: AppspressoPluginDefinition<void>,
): () => ResolvedAppspressoPlugin<void>;

export function definePlugin<TConfig>(
  definition: AppspressoPluginDefinition<TConfig>,
):
  | ((config: TConfig) => ResolvedAppspressoPlugin<TConfig>)
  | (() => ResolvedAppspressoPlugin<void>) {
  if (definition.configSchema) {
    return createFactory(definition) as (
      config: TConfig,
    ) => ResolvedAppspressoPlugin<TConfig>;
  }
  const factory = createFactory(definition);
  return (() => factory()) as () => ResolvedAppspressoPlugin<void>;
}

/** Validate config with Zod outside `definePlugin` (e.g. tests). */
export function parsePluginConfig<T>(
  pluginName: string,
  schema: z.ZodType<T>,
  config: unknown,
): T {
  const result = schema.safeParse(config);
  if (!result.success) {
    throw new PluginConfigError(pluginName, result.error.message);
  }
  return result.data;
}
