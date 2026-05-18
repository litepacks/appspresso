import * as React from "react";
import { appFooterVariants } from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppFooterProps = React.HTMLAttributes<HTMLElement>;

export const AppFooter = React.forwardRef<HTMLElement, AppFooterProps>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(appFooterVariants(), className)}
      {...props}
    />
  ),
);
AppFooter.displayName = "AppFooter";
