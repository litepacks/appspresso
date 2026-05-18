import * as React from "react";
import { appMainPaneVariants } from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppMainPaneProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Column filling remaining space in `AppMain` (`flex-1`, `min-h-0`).
 * Used for full-screen outlet or nested `AppPage` layout.
 */
export const AppMainPane = React.forwardRef<HTMLDivElement, AppMainPaneProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(appMainPaneVariants(), className)}
      {...props}
    />
  ),
);
AppMainPane.displayName = "AppMainPane";
