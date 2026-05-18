import * as React from "react";
import {
  type AppContentPadding,
  appContentVariants,
} from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppContentProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: AppContentPadding;
};

export const AppContent = React.forwardRef<HTMLDivElement, AppContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(appContentVariants({ padding }), className)}
      {...props}
    />
  ),
);
AppContent.displayName = "AppContent";
