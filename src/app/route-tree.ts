import type { ComponentType } from "react";

export type LayoutKind = "main" | "minimal" | "onboarding";

/** For Lucide icon mapping in the bottom tab bar */
export type TabBarIconKey =
  | "home"
  | "settings"
  | "database"
  | "purchase"
  | "referral"
  | "notifications";

export type RouteHandle = {
  titleKey: string;
  tabId?: string;
  /** Icon shown in bottom bar when `tabId` is set */
  tabIcon?: TabBarIconKey;
  showTabBar?: boolean;
  /** When `true`, `AppBottomTabShell` hides while keyboard is open */
  hideTabBarWhenKeyboardOpen?: boolean;
  layout?: LayoutKind;
};

export type RouteTreeEntry = {
  path: string;
  handle: RouteHandle;
  /** Raw dynamic import for React Router `lazy` prop */
  load: () => Promise<{ default: ComponentType }>;
};

export const routeTree: readonly RouteTreeEntry[] = [
  {
    path: "",
    handle: {
      titleKey: "nav.home",
      tabId: "home",
      tabIcon: "home",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Home"),
  },
  {
    path: "settings",
    handle: {
      titleKey: "nav.settings",
      tabId: "settings",
      tabIcon: "settings",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Settings"),
  },
  {
    path: "database",
    handle: {
      titleKey: "nav.database",
      tabId: "database",
      tabIcon: "database",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Database"),
  },
  {
    path: "purchase",
    handle: {
      titleKey: "nav.purchase",
      tabId: "purchase",
      tabIcon: "purchase",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Purchases"),
  },
  {
    path: "referral",
    handle: {
      titleKey: "nav.referral",
      tabId: "referral",
      tabIcon: "referral",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Referral"),
  },
  {
    path: "notifications",
    handle: {
      titleKey: "nav.notifications",
      tabId: "notifications",
      tabIcon: "notifications",
      showTabBar: true,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/Notifications"),
  },
  {
    path: "notifications/detail",
    handle: {
      titleKey: "notifications.detailTitle",
      showTabBar: false,
      layout: "main",
    } satisfies RouteHandle,
    load: () => import("@/pages/NotificationDetail"),
  },
];
