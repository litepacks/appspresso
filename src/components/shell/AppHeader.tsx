import * as React from "react";
import { appHeaderVariants } from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppHeaderProps = React.HTMLAttributes<HTMLElement>;

export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(appHeaderVariants(), className)}
      {...props}
    />
  ),
);
AppHeader.displayName = "AppHeader";
