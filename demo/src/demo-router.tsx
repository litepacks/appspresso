import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import { AuthEntry } from "appspresso/app/AuthEntry";
import { AuthLayout } from "appspresso/components/AuthLayout";
import { AppPage, AppTopBar } from "appspresso/components/shell";
import { SearchInput } from "appspresso/components/ui/search-input";
import { LoadingFallback } from "appspresso/components/LoadingFallback";
import { useTranslation } from "react-i18next";
import { Suspense, lazy, useMemo } from "react";
import {
  createBrowserRouter,
  createHashRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useMatches,
  useNavigate,
  type RouteObject,
} from "react-router-dom";
import { DemoMain } from "./DemoMain";
import { DemoTabBar } from "./DemoTabBar";
import {
  demoShowcaseChildRouteObjects,
  getDemoNavSpecs,
  getDemoTitleKey,
} from "./demoShowcaseRoutes";

// Lazy load auth page
const AuthLoginPage = lazy(() => import("appspresso/pages/AuthLoginPage"));

function DemoLayout() {
  const { t } = useTranslation("demo");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const links = getDemoNavSpecs().map((n) => ({
    ...n,
    label: t(n.labelKey),
  }));

  const shellRoute = location.pathname.startsWith("/features/shell");
  const lastHandle = matches[matches.length - 1]?.handle;
  const titleKey = getDemoTitleKey(lastHandle);
  const atRoot = location.pathname === "/" || location.pathname === "";

  return (
    <AppPage height="viewport" className="min-h-0 min-w-0 flex-1">
      <AppTopBar
        title={t(titleKey)}
        showBack={!atRoot}
        center={
          atRoot ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-2">
              <p
                data-testid="demo-home-title"
                className="text-pretty text-center text-base font-semibold leading-snug tracking-tight sm:text-lg"
              >
                {t(titleKey)}
              </p>
              <SearchInput
                placeholder={t("app.searchPlaceholder")}
                aria-label={t("app.searchAria")}
                name="demo-header-search"
                data-testid="demo-header-search"
              />
            </div>
          ) : undefined
        }
      />
      <DemoMain
        shellRoute={shellRoute}
        pullToRefreshStatusLabel={t("app.pullToRefresh.status")}
        onPullToRefresh={async () => {
          await queryClient.invalidateQueries();
          await new Promise((r) => setTimeout(r, 280));
        }}
      />
      <DemoTabBar
        links={links}
        pathname={location.pathname}
        navigate={navigate}
        ariaLabel={t("app.nav.ariaLabel")}
        hideWhenKeyboardOpen
      />
    </AppPage>
  );
}

/** Root route under RouterProvider; `flex-1` chain pins the tab bar to the viewport bottom. */
function DemoRouteRoot() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DemoLayout />
    </div>
  );
}

function DemoRootShell() {
  return <Outlet />;
}

function buildDemoRouteObjects(): RouteObject[] {
  return [
    {
      path: "/",
      element: <DemoRootShell />,
      children: [
        {
          path: "auth",
          element: <AuthEntry />,
          children: [
            {
              element: <AuthLayout />,
              children: [
                {
                  path: "login",
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <AuthLoginPage />
                    </Suspense>
                  ),
                },
              ],
            },
          ],
        },
        {
          element: <DemoRouteRoot />,
          children: demoShowcaseChildRouteObjects,
        },
      ],
    },
  ];
}

/** Resolve router factory at call time so Capacitor bridge is ready on native. */
export function createDemoRouterInstance() {
  const create =
    Capacitor.getPlatform() !== "web" ? createHashRouter : createBrowserRouter;
  return create(buildDemoRouteObjects());
}

/** @deprecated Prefer `<DemoRouterProvider />` for lazy native-safe router creation. */
export const demoRouter = createDemoRouterInstance();

/** Creates the router after mount — avoids `isNativePlatform()` false negatives at import time. */
export function DemoRouterProvider() {
  const router = useMemo(() => createDemoRouterInstance(), []);
  return <RouterProvider router={router} />;
}
