import { OutletErrorBoundary } from "appspresso/components/OutletErrorBoundary";
import { AppMain, AppMainPane } from "appspresso/components/shell";
import { AnimatedOutlet } from "appspresso/motion/AnimatedOutlet";
import { lazy, Suspense } from "react";

// Lazy load PullToRefresh (heavy framer-motion dependency)
const PullToRefresh = lazy(() =>
  import("appspresso/components/ui/pull-to-refresh").then((m) => ({
    default: m.PullToRefresh,
  })),
);

export type DemoMainProps = {
  /** Full-height shell samples like `/features/shell`: pull-to-refresh off. */
  shellRoute: boolean;
  pullToRefreshStatusLabel: string;
  onPullToRefresh: () => void | Promise<void>;
};

/**
 * Demo body: scrollable `main` between top bar and tab bar (optional PTR).
 */
export function DemoMain({
  shellRoute,
  pullToRefreshStatusLabel,
  onPullToRefresh,
}: DemoMainProps) {
  const outlet = (
    <OutletErrorBoundary>
      <AnimatedOutlet />
    </OutletErrorBoundary>
  );

  return (
    <AppMain>
      {shellRoute ? (
        <AppMainPane>{outlet}</AppMainPane>
      ) : (
        <Suspense fallback={<AppMainPane>{outlet}</AppMainPane>}>
          <PullToRefresh
            className="px-4 py-5"
            statusLabel={pullToRefreshStatusLabel}
            onRefresh={onPullToRefresh}
          >
            {outlet}
          </PullToRefresh>
        </Suspense>
      )}
    </AppMain>
  );
}
