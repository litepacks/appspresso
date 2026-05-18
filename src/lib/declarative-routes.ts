import type { ComponentType, ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

/** Dynamic import wrapper for React Router `lazy` prop */
export function lazyRouteFromImport(
  mod: () => Promise<{ default: ComponentType }>,
) {
  return async () => {
    const m = await mod();
    return { Component: m.default };
  };
}

export type DeclarativeLazyLeaf = {
  path?: string;
  index?: boolean;
  handle?: unknown;
  lazy: () => Promise<{ default: ComponentType }>;
};

/** Converts leaf routes defined with `lazy` to `RouteObject[]` */
export function declarativeLazyLeavesToRouteObjects(
  leaves: readonly DeclarativeLazyLeaf[],
): RouteObject[] {
  return leaves.map((r) =>
    r.index
      ? {
          index: true,
          handle: r.handle,
          lazy: lazyRouteFromImport(r.lazy),
        }
      : {
          path: r.path ?? "",
          handle: r.handle,
          lazy: lazyRouteFromImport(r.lazy),
        },
  );
}

export type DeclarativeElementLeaf = {
  path?: string;
  index?: boolean;
  handle?: unknown;
  element: ReactNode;
};

/** Leaf routes with `element` (e.g. demo showcase) */
export function declarativeElementLeavesToRouteObjects(
  leaves: readonly DeclarativeElementLeaf[],
): RouteObject[] {
  return leaves.map((r) =>
    r.index
      ? { index: true, handle: r.handle, element: r.element }
      : { path: r.path ?? "", handle: r.handle, element: r.element },
  );
}
