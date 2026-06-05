import type { RouteTreeEntry } from "@/app/route-tree";
import type { ModuleRegistry } from "./registry";

export function collectModuleAppRoutes(
  registry: ModuleRegistry,
  hostRoutes: readonly RouteTreeEntry[],
): readonly RouteTreeEntry[] {
  const byPath = new Map(hostRoutes.map((r) => [r.path, r]));
  for (const mod of registry.activeModules) {
    if (!mod.appRoutes) continue;
    for (const entry of mod.appRoutes(mod.config)) {
      byPath.set(entry.path, entry);
    }
  }
  return [...byPath.values()];
}
