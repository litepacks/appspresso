import { resetAuthPluginBridge } from "appspresso/auth/plugin-bridge";
import type { ResolvedAppspressoPlugin } from "appspresso/plugin";
import {
  createPluginRegistry,
  type PluginRegistry,
  resetPluginRuntimeState,
} from "appspresso/plugin";

export type PluginTestRuntime = {
  registry: PluginRegistry;
  runLifecycle: () => Promise<void>;
  dispose: () => Promise<void>;
};

export type CreatePluginTestRuntimeOptions = {
  plugins?: readonly ResolvedAppspressoPlugin[];
};

/**
 * In-memory plugin host for unit tests (no React tree).
 */
export function createPluginTestRuntime(
  options: CreatePluginTestRuntimeOptions = {},
): PluginTestRuntime {
  const registry = createPluginRegistry(options.plugins ?? []);
  return {
    registry,
    async runLifecycle() {
      await registry.runSetupAll();
      await registry.runOnBootstrapAll();
      await registry.runOnAppReadyAll();
    },
    async dispose() {
      await registry.runDisposeAll();
      resetAuthPluginBridge();
      resetPluginRuntimeState();
    },
  };
}
