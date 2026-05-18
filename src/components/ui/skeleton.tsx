import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Loading placeholder: `animate-pulse` + `bg-muted`.
 * Pass `className` such as `h-4 w-full` for text lines or `size-10 shrink-0 rounded-full` for avatars.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className,
      )}
      aria-hidden
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
export default Skeleton;
