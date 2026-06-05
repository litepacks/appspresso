import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

type CreateBrowserRouterOptions = NonNullable<
  Parameters<typeof createBrowserRouter>[1]
>;

import { AuthEntry } from "@/app/AuthEntry";
import { OnboardingEntry } from "@/app/OnboardingEntry";
import { OnboardingGate } from "@/app/OnboardingGate";
import { RootShell } from "@/app/RootShell";
import { routeTree } from "@/app/route-tree";
import { AuthLayout } from "@/components/AuthLayout";
import { Layout } from "@/components/Layout";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import {
  declarativeLazyLeavesToRouteObjects,
  lazyRouteFromImport,
} from "@/lib/declarative-routes";
import {
  collectModuleAppRoutes,
  collectModuleRoutes,
  moduleRequiresOnboardingGate,
  type ModuleRegistry,
} from "@/module";

export type AppspressoRouterOptions = Pick<
  CreateBrowserRouterOptions,
  "basename" | "future"
> & {
  modules?: ModuleRegistry;
  appRoutes?: typeof routeTree;
  /** Inline showcase auth/onboarding when no `modules` (default true). */
  legacyShowcase?: boolean;
};

function legacyShowcasePreAppRoutes(): RouteObject[] {
  return [
    {
      path: "onboarding",
      element: <OnboardingEntry />,
      children: [
        {
          element: <OnboardingLayout />,
          children: [
            {
              index: true,
              lazy: lazyRouteFromImport(() => import("@/pages/OnboardingPage")),
            },
          ],
        },
      ],
    },
    {
      path: "auth",
      element: <AuthEntry />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              path: "login",
              lazy: lazyRouteFromImport(() => import("@/pages/AuthLoginPage")),
            },
            {
              path: "register",
              lazy: lazyRouteFromImport(
                () => import("@/pages/AuthRegisterPage"),
              ),
            },
            {
              path: "forgot-password",
              lazy: lazyRouteFromImport(
                () => import("@/pages/AuthForgotPasswordPage"),
              ),
            },
          ],
        },
      ],
    },
  ];
}

function buildAppChildren(options?: AppspressoRouterOptions): RouteObject[] {
  const registry = options?.modules;
  const baseTree = options?.appRoutes ?? routeTree;
  const appTree = registry
    ? collectModuleAppRoutes(registry, baseTree)
    : baseTree;
  const useLegacy = !registry && options?.legacyShowcase !== false;

  const preApp = registry
    ? collectModuleRoutes(registry, "pre-app")
    : useLegacy
      ? legacyShowcasePreAppRoutes()
      : [];

  const appRouteObjects = declarativeLazyLeavesToRouteObjects(
    appTree.map((r) =>
      r.path === ""
        ? { index: true as const, handle: r.handle, lazy: r.load }
        : { path: r.path, handle: r.handle, lazy: r.load },
    ),
  );

  const postApp = registry ? collectModuleRoutes(registry, "post-app") : [];

  const mainApp: RouteObject = {
    element: <Layout />,
    children: [
      ...appRouteObjects,
      ...postApp,
      {
        path: "*",
        lazy: lazyRouteFromImport(() => import("@/pages/NotFound")),
      },
    ],
  };

  const needsGate = registry
    ? moduleRequiresOnboardingGate(registry)
    : useLegacy;

  const gatedApp = needsGate
    ? { element: <OnboardingGate />, children: [mainApp] }
    : mainApp;

  const appOrder = registry ? collectModuleRoutes(registry, "app") : [];

  return [...preApp, ...appOrder, gatedApp];
}

function appspressoRouteObjects(options?: AppspressoRouterOptions) {
  return [
    {
      path: "/",
      element: <RootShell />,
      children: buildAppChildren(options),
    },
  ];
}

export function createAppspressoBrowserRouter(
  options?: AppspressoRouterOptions,
) {
  return createBrowserRouter(appspressoRouteObjects(options), options);
}

export const router = createAppspressoBrowserRouter({ legacyShowcase: true });
