import * as React from "react";
import {
  type AppPageHeight,
  appPageVariants,
} from "@/components/shell/shell-base";
import { cn } from "@/lib/utils";

export type AppPageProps = React.HTMLAttributes<HTMLDivElement> & {
  height?: AppPageHeight;
};

export const AppPage = React.forwardRef<HTMLDivElement, AppPageProps>(
  ({ className, height, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(appPageVariants({ height }), className)}
      {...props}
    />
  ),
);
AppPage.displayName = "AppPage";
