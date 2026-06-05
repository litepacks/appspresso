import type { RouteTreeEntry } from "@/app/route-tree";
import { routeTree } from "@/app/route-tree";

/** Host tab routes when showcase modules provide settings/notifications/purchase. */
const MODULE_OWNED_PATHS = new Set([
  "settings",
  "notifications",
  "notifications/detail",
  "purchase",
]);

export const showcaseAppRoutes: readonly RouteTreeEntry[] = routeTree.filter(
  (r) => !MODULE_OWNED_PATHS.has(r.path),
);
