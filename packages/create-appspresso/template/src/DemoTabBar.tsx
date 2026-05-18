import { BottomTabBar } from "appspresso/components/BottomTabBar";
import { AppBottomTabShell } from "appspresso/components/shell";
import type { IconName } from "appspresso/components/ui/icon";
import { Icon } from "appspresso/components/ui/icon";
import { cn } from "appspresso/lib/utils";
import { useMemo } from "react";

export type DemoTabBarLink = {
  to: string;
  end?: boolean;
  label: string;
  icon: IconName;
  badgeCount?: number;
};

type DemoTabBarProps = {
  links: readonly DemoTabBarLink[];
  pathname: string;
  navigate: (to: string) => void;
  ariaLabel: string;
  hideWhenKeyboardOpen?: boolean;
};

/**
 * Demo bottom tab: full-width AppBottomTabShell + BottomTabBar.
 */
export function DemoTabBar({
  links,
  pathname,
  navigate,
  ariaLabel,
  hideWhenKeyboardOpen = false,
}: DemoTabBarProps) {
  const items = useMemo(
    () =>
      links.map((l) => ({
        id: l.to,
        to: l.to,
        end: l.end,
        label: l.label,
        badgeCount: l.badgeCount,
        renderIcon: (active: boolean) => (
          <Icon
            name={l.icon}
            size="sm"
            className={cn(active ? "stroke-2" : "stroke-[1.5]")}
          />
        ),
      })),
    [links],
  );

  return (
    <AppBottomTabShell
      ariaLabel={ariaLabel}
      hideWhenKeyboardOpen={hideWhenKeyboardOpen}
    >
      <BottomTabBar items={items} pathname={pathname} navigate={navigate} />
    </AppBottomTabShell>
  );
}
