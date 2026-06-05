import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import type { RouteHandle, RouteTreeEntry } from "@/app/route-tree";
import { lazyRouteFromImport } from "@/lib/declarative-routes";
import type { AppspressoRoutesConfig, RouteEntry } from "@/studio/routes/schema";

function screenToImport(screen: string): () => Promise<{ default: ComponentType }> {
  if (screen.startsWith("@/")) {
    const mod = screen.slice(2);
    return () => import(/* @vite-ignore */ `@/${mod}`);
  }
  if (screen.startsWith("appspresso/")) {
    return () => import(/* @vite-ignore */ screen);
  }
  if (screen.startsWith("./")) {
    return () => import(/* @vite-ignore */ screen);
  }
  return () => import(/* @vite-ignore */ `./${screen}`);
}

function toRouteHandle(entry: RouteEntry): RouteHandle {
  return {
    titleKey: entry.titleKey,
    tabId: entry.id,
    tabIcon: entry.icon as RouteHandle["tabIcon"],
    showTabBar: entry.showTabBar ?? true,
    hideTabBarWhenKeyboardOpen: entry.hideTabBarWhenKeyboardOpen,
    layout: "main",
  };
}

function entryToTree(entry: RouteEntry): RouteTreeEntry {
  return {
    path: entry.path,
    handle: toRouteHandle(entry),
    load: screenToImport(entry.screen),
  };
}

/** Tab specs derived from the same config as the router (fixes tab/router desync). */
export function getTabEntriesFromRoutes(
  config: AppspressoRoutesConfig,
): RouteTreeEntry[] {
  return config.tabs.map(entryToTree);
}

/** Convert Studio route config to lazy RouteObject leaves. */
export function routesConfigToRouteObjects(
  config: AppspressoRoutesConfig,
): RouteObject[] {
  const leaves = [...config.tabs, ...config.stack];
  return leaves.map((entry) =>
    entry.path === ""
      ? {
          index: true as const,
          handle: toRouteHandle(entry),
          lazy: lazyRouteFromImport(screenToImport(entry.screen)),
        }
      : {
          path: entry.path,
          handle: toRouteHandle(entry),
          lazy: lazyRouteFromImport(screenToImport(entry.screen)),
        },
  );
}

export function routesConfigToPreAppObjects(
  config: AppspressoRoutesConfig,
): RouteObject[] {
  return config.preApp.map((entry) => ({
    path: entry.path,
    handle: toRouteHandle(entry),
    lazy: lazyRouteFromImport(screenToImport(entry.screen)),
  }));
}
