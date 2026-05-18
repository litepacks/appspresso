import * as React from "react";
import {
  type AppToolbarDensity,
  appToolbarEndVariants,
  appToolbarStartVariants,
  appToolbarTitleVariants,
  appToolbarVariants,
} from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppToolbarProps = React.HTMLAttributes<HTMLDivElement> & {
  density?: AppToolbarDensity;
  start?: React.ReactNode;
  title?: React.ReactNode;
  end?: React.ReactNode;
};

export const AppToolbar = React.forwardRef<HTMLDivElement, AppToolbarProps>(
  ({ className, density, start, title, end, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(appToolbarVariants({ density }), className)}
      {...props}
    >
      {start != null ? (
        <div className={appToolbarStartVariants()}>{start}</div>
      ) : null}
      {title != null ? (
        <div className={appToolbarTitleVariants()}>{title}</div>
      ) : null}
      {end != null ? (
        <div className={appToolbarEndVariants()}>{end}</div>
      ) : null}
      {children}
    </div>
  ),
);
AppToolbar.displayName = "AppToolbar";
