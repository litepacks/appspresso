import {
  BellIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  GiftIcon,
  HomeIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  type RouteTreeEntry,
  routeTree,
  type TabBarIconKey,
} from "@/app/route-tree";
import { BottomTabBar } from "@/components/BottomTabBar";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const TAB_ICONS: Record<TabBarIconKey, IconComponent> = {
  home: HomeIcon,
  settings: Cog6ToothIcon,
  database: CircleStackIcon,
  purchase: ShoppingBagIcon,
  referral: GiftIcon,
  notifications: BellIcon,
};

const tabRoutes = routeTree.filter((r) => "tabId" in r.handle);

function pathToTabHref(path: string) {
  return path === "" ? "/" : `/${path}`;
}

export function BottomTabs() {
  const { t } = useTranslation();
  const loc = useLocation();
  const navigate = useNavigate();

  const items = tabRoutes.map((r: RouteTreeEntry) => {
    const to = pathToTabHref(r.path);
    const iconKey = r.handle.tabIcon ?? "home";
    const Icon = TAB_ICONS[iconKey];
    const id = r.path || "home";
    return {
      id,
      to,
      end: r.path === "" ? true : undefined,
      label: t(r.handle.titleKey),
      renderIcon: (active: boolean) => (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "stroke-2" : "stroke-[1.5]",
          )}
          aria-hidden
        />
      ),
    };
  });

  return (
    <BottomTabBar
      items={items}
      pathname={loc.pathname}
      navigate={(to) => {
        navigate(to);
      }}
    />
  );
}
