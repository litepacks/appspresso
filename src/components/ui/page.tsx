import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const pageVariants = cva("mx-auto flex w-full min-w-0 flex-col gap-6", {
  variants: {
    maxWidth: {
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    maxWidth: "lg",
  },
});

export type PageProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageVariants>;

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ className, maxWidth, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(pageVariants({ maxWidth }), className)}
      {...props}
    />
  ),
);
Page.displayName = "Page";

export { Page, pageVariants };
