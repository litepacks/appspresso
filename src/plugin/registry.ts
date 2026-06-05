import type { ReactNode } from "react";
import type { AppspressoProviderLayer } from "@/app/RootProviders";
import { logger } from "@/lib/logger";
import {
  type HostCapabilitySnapshot,
  parseCapabilityToken,
  resolveHostCapabilities,
} from "./capabilities";
import {
  createPluginContext,
  isPluginActiveOnPlatform,
  resetPluginRuntimeState,
} from "./context";
import {
  PluginConflictError,
  PluginDependencyCycleError,
  PluginMissingDependencyError,
} from "./errors";
import type { PluginContext, ResolvedAppspressoPlugin } from "./types";

export type PluginRegistryOptions = {
  omit?: readonly AppspressoProviderLayer[];
};

export type PluginRegistrySummary = {
  names: string[];
  skipped: string[];
};

export class PluginRegistry {
  readonly #plugins: ResolvedAppspressoPlugin[];
  readonly #host: HostCapabilitySnapshot;
  readonly #ctx: PluginContext;
  readonly #active: ResolvedAppspressoPlugin[];
  readonly #skipped: string[] = [];

  constructor(
    plugins: readonly ResolvedAppspressoPlugin[],
    options: PluginRegistryOptions = {},
  ) {
    this.#host = resolveHostCapabilities(options.omit);
    this.#plugins = [...plugins];
    validateConflicts(this.#plugins);
    const sorted = topologicalSortPlugins(this.#plugins);
    this.#active = [];
    for (const plugin of sorted) {
      if (!isPluginActiveOnPlatform(plugin.platforms)) {
        this.#skipped.push(plugin.name);
        logger.warn(`plugin:skip platform`, { name: plugin.name });
        continue;
      }
      assertCapabilities(plugin, this.#host);
      this.#active.push(plugin);
    }
    this.#ctx = createPluginContext(this.#host);
  }

  get context(): PluginContext {
    return this.#ctx;
  }

  get summary(): PluginRegistrySummary {
    return {
      names: this.#active.map((p) => p.name),
      skipped: [...this.#skipped],
    };
  }

  async runSetupAll(): Promise<void> {
    for (const plugin of this.#active) {
      if (plugin.setup) {
        await plugin.setup(this.#ctx, plugin.config);
      }
    }
  }

  async runOnBootstrapAll(): Promise<void> {
    for (const plugin of this.#active) {
      if (plugin.onBootstrap) {
        await plugin.onBootstrap(this.#ctx, plugin.config);
      }
    }
  }

  async runOnAppReadyAll(): Promise<void> {
    for (const plugin of this.#active) {
      if (plugin.onAppReady) {
        await plugin.onAppReady(this.#ctx, plugin.config);
      }
    }
  }

  async runDisposeAll(): Promise<void> {
    for (const plugin of [...this.#active].reverse()) {
      if (plugin.dispose) {
        await plugin.dispose(this.#ctx, plugin.config);
      }
    }
    resetPluginRuntimeState();
  }

  wrapProviders(children: ReactNode): ReactNode {
    let node = children;
    for (const plugin of this.#active) {
      if (plugin.extendProviders) {
        node = plugin.extendProviders(this.#ctx, node);
      }
    }
    return node;
  }
}

export function createPluginRegistry(
  plugins: readonly ResolvedAppspressoPlugin[],
  options?: PluginRegistryOptions,
): PluginRegistry {
  return new PluginRegistry(plugins, options);
}

function assertCapabilities(
  plugin: ResolvedAppspressoPlugin,
  host: HostCapabilitySnapshot,
): void {
  for (const raw of plugin.requires) {
    const cap = parseCapabilityToken(raw);
    if (!cap) {
      throw new PluginMissingDependencyError(plugin.name, raw);
    }
    if (!host.capabilities.has(cap)) {
      throw new PluginMissingDependencyError(plugin.name, cap);
    }
  }
}

function validateConflicts(plugins: ResolvedAppspressoPlugin[]): void {
  const names = new Set(plugins.map((p) => p.name));
  for (const plugin of plugins) {
    for (const other of plugin.conflicts) {
      if (names.has(other)) {
        throw new PluginConflictError(plugin.name, other);
      }
    }
  }
}

function topologicalSortPlugins(
  plugins: ResolvedAppspressoPlugin[],
): ResolvedAppspressoPlugin[] {
  const byName = new Map(plugins.map((p) => [p.name, p]));
  const names = new Set(byName.keys());
  const visited = new Set<string>();
  const stack = new Set<string>();
  const out: ResolvedAppspressoPlugin[] = [];

  function visit(name: string): void {
    if (visited.has(name)) return;
    if (stack.has(name)) {
      throw new PluginDependencyCycleError([...stack, name]);
    }
    stack.add(name);
    const plugin = byName.get(name);
    if (plugin) {
      for (const dep of plugin.after) {
        if (names.has(dep)) visit(dep);
      }
    }
    stack.delete(name);
    visited.add(name);
    if (plugin) out.push(plugin);
  }

  const sortedNames = [...names].sort();
  for (const name of sortedNames) {
    visit(name);
  }
  return out;
}
