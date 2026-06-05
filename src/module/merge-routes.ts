import type { RouteObject } from "react-router-dom";
import type { ModuleRegistry } from "./registry";
import type { ModuleRouteContribution, ModuleRouteOrder } from "./types";

function prefixRoutes(
  basePath: string | undefined,
  routes: RouteObject[],
): RouteObject[] {
  if (!basePath) return routes;
  const trimmed = basePath.replace(/^\/+|\/+$/g, "");
  return [
    {
      path: trimmed,
      children: routes,
    },
  ];
}

function wrapLayout(contribution: ModuleRouteContribution): RouteObject[] {
  const inner = prefixRoutes(contribution.basePath, contribution.routes);
  if (!contribution.layout) return inner;
  return [
    {
      element: contribution.layout.element,
      path: contribution.layout.path,
      id: contribution.layout.id,
      children: inner,
    } as RouteObject,
  ];
}

export function collectModuleRoutes(
  registry: ModuleRegistry,
  order: ModuleRouteOrder,
): RouteObject[] {
  const out: RouteObject[] = [];
  for (const mod of registry.activeModules) {
    if (!mod.routes) continue;
    const contribution = mod.routes(mod.config);
    if ((contribution.order ?? "pre-app") !== order) continue;
    out.push(...wrapLayout(contribution));
  }
  return out;
}

export function moduleRequiresOnboardingGate(registry: ModuleRegistry): boolean {
  for (const mod of registry.activeModules) {
    if (!mod.routes) continue;
    const c = mod.routes(mod.config);
    if (c.requiresOnboardingGate) return true;
  }
  return registry.activeModules.some((m) => m.name === "onboarding");
}
