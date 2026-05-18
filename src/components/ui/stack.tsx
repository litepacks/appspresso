import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex min-w-0", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    },
  },
  defaultVariants: {
    direction: "col",
    align: "stretch",
    justify: "start",
    gap: "sm",
  },
});

export type StackProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof stackVariants>;

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        stackVariants({ direction, align, justify, gap }),
        className,
      )}
      {...props}
    />
  ),
);
Stack.displayName = "Stack";
