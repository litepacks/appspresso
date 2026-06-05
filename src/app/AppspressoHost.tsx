import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { AppspressoBootstrapGate } from "@/app/AppspressoBootstrapGate";
import {
  type AppspressoProviderLayer,
  AppspressoRootProviders,
  type AppspressoRootProvidersProps,
} from "@/app/RootProviders";
import {
  createModuleRegistry,
  getActiveModuleRegistry,
  setActiveModuleRegistry,
  type ModuleRegistry,
  type ModuleRegistrySummary,
} from "@/module";
import {
  getActivePluginRegistry,
  setActivePluginRegistry,
} from "@/plugin/active-registry";
import {
  createPluginRegistry,
  type PluginRegistry,
  type PluginRegistrySummary,
} from "@/plugin/registry";
import type { ResolvedAppspressoModule } from "@/module/types";
import type { ResolvedAppspressoPlugin } from "@/plugin/types";

export type AppspressoHostProps = {
  children: ReactNode;
  plugins?: readonly ResolvedAppspressoPlugin[];
  modules?: readonly ResolvedAppspressoModule[];
  omit?: AppspressoProviderLayer[];
  authAdapter?: AppspressoRootProvidersProps["authAdapter"];
  filesystemConfig?: AppspressoRootProvidersProps["filesystemConfig"];
  skipBootstrap?: boolean;
};

function HostRegistriesLifecycle({
  pluginRegistry,
  moduleRegistry,
  children,
  skipBootstrap,
}: {
  pluginRegistry: PluginRegistry;
  moduleRegistry: ModuleRegistry | null;
  children: ReactNode;
  skipBootstrap?: boolean;
}) {
  const appReadyFired = useRef(false);

  useEffect(() => {
    setActivePluginRegistry(pluginRegistry);
    if (moduleRegistry) setActiveModuleRegistry(moduleRegistry);
    void pluginRegistry.runSetupAll();
    void moduleRegistry?.runSetupAll();
    return () => {
      void pluginRegistry.runDisposeAll();
      void moduleRegistry?.runDisposeAll();
      setActivePluginRegistry(null);
      setActiveModuleRegistry(null);
      appReadyFired.current = false;
    };
  }, [pluginRegistry, moduleRegistry]);

  let node: ReactNode = children;
  if (moduleRegistry) node = moduleRegistry.wrapProviders(node);
  node = pluginRegistry.wrapProviders(node);

  if (skipBootstrap) return <>{node}</>;

  return (
    <AppspressoBootstrapGate
      onReady={async () => {
        if (appReadyFired.current) return;
        appReadyFired.current = true;
        if (moduleRegistry) await moduleRegistry.runOnBootstrapAll();
        await pluginRegistry.runOnAppReadyAll();
      }}
    >
      {node}
    </AppspressoBootstrapGate>
  );
}

export function AppspressoHost({
  children,
  plugins = [],
  modules = [],
  omit,
  authAdapter,
  filesystemConfig,
  skipBootstrap = false,
}: AppspressoHostProps) {
  const pluginRegistry = useMemo(
    () => createPluginRegistry(plugins, { omit }),
    [plugins, omit],
  );
  const moduleRegistry = useMemo(
    () => (modules.length > 0 ? createModuleRegistry(modules) : null),
    [modules],
  );

  return (
    <AppspressoRootProviders
      omit={omit}
      authAdapter={authAdapter}
      filesystemConfig={filesystemConfig}
    >
      <HostRegistriesLifecycle
        pluginRegistry={pluginRegistry}
        moduleRegistry={moduleRegistry}
        skipBootstrap={skipBootstrap}
      >
        {children}
      </HostRegistriesLifecycle>
    </AppspressoRootProviders>
  );
}

export function getHostPluginSummary(): PluginRegistrySummary | null {
  return getActivePluginRegistry()?.summary ?? null;
}

export function getHostModuleSummary(): ModuleRegistrySummary | null {
  return getActiveModuleRegistry()?.summary ?? null;
}
