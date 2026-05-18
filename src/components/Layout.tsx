import { useTranslation } from "react-i18next";
import { useMatches } from "react-router-dom";
import type { RouteHandle } from "@/app/route-tree";
import { BottomTabs } from "@/components/BottomTabs";
import { OutletErrorBoundary } from "@/components/OutletErrorBoundary";
import { AppBottomTabShell } from "@/components/shell/AppBottomTabShell";
import { AppTopBar } from "@/components/shell/AppTopBar";
import { cn } from "@/lib/utils";
import { AnimatedOutlet } from "@/motion";

export function Layout() {
  const matches = useMatches();
  const { t } = useTranslation();
  const handle = matches[matches.length - 1]?.handle as RouteHandle | undefined;
  const titleKey = handle?.titleKey ?? "nav.home";
  const showTabs = handle?.showTabBar !== false;

  return (
    <div className={cn("app-shell flex min-h-0 flex-col bg-background")}>
      <AppTopBar title={t(titleKey)} />
      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
          "px-4 py-4",
        )}
      >
        <OutletErrorBoundary>
          <AnimatedOutlet />
        </OutletErrorBoundary>
      </main>
      {showTabs ? (
        <AppBottomTabShell
          ariaLabel={t("nav.tabBar")}
          hideWhenKeyboardOpen={handle?.hideTabBarWhenKeyboardOpen === true}
        >
          <BottomTabs />
        </AppBottomTabShell>
      ) : null}
    </div>
  );
}
