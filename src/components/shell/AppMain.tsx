import * as React from "react";
import { appMainVariants } from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppMainProps = React.HTMLAttributes<HTMLElement>;

/**
 * Semantic `<main>` between `AppTopBar` and bottom navigation in shell layout.
 * Default style clips overflow; scrolling lives on `AppContent`, `PullToRefresh`, etc.
 */
export const AppMain = React.forwardRef<HTMLElement, AppMainProps>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn(appMainVariants(), className)} {...props} />
  ),
);
AppMain.displayName = "AppMain";
