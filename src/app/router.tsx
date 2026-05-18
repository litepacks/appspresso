import { createBrowserRouter } from "react-router-dom";

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

export type AppspressoRouterOptions = Pick<
  CreateBrowserRouterOptions,
  "basename" | "future"
>;

function appspressoRouteObjects() {
  return [
    {
      path: "/",
      element: <RootShell />,
      children: [
        {
          path: "onboarding",
          element: <OnboardingEntry />,
          children: [
            {
              element: <OnboardingLayout />,
              children: [
                {
                  index: true,
                  lazy: lazyRouteFromImport(
                    () => import("@/pages/OnboardingPage"),
                  ),
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
                  lazy: lazyRouteFromImport(
                    () => import("@/pages/AuthLoginPage"),
                  ),
                },
              ],
            },
          ],
        },
        {
          element: <OnboardingGate />,
          children: [
            {
              element: <Layout />,
              children: [
                ...declarativeLazyLeavesToRouteObjects(
                  routeTree.map((r) =>
                    r.path === ""
                      ? {
                          index: true as const,
                          handle: r.handle,
                          lazy: r.load,
                        }
                      : {
                          path: r.path,
                          handle: r.handle,
                          lazy: r.load,
                        },
                  ),
                ),
                {
                  path: "*",
                  lazy: lazyRouteFromImport(() => import("@/pages/NotFound")),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

/** Built-in onboarding + tab schema + page tree (`route-tree`). */
export function createAppspressoBrowserRouter(
  options?: AppspressoRouterOptions,
) {
  return createBrowserRouter(appspressoRouteObjects(), options);
}

export const router = createAppspressoBrowserRouter();
