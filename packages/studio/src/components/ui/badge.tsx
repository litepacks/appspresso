import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary ring-1 ring-primary/20",
        secondary: "bg-muted text-muted-foreground ring-1 ring-border",
        destructive: "bg-red-500/15 text-red-400 ring-1 ring-red-500/25",
        outline: "text-muted-foreground ring-1 ring-border",
        success: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
        warning: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
  };

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span
          className={cn(
            "size-1.5 rounded-full",
            variant === "success" && "bg-emerald-400 shadow-[0_0_6px_hsl(152_76%_50%/0.6)]",
            variant === "destructive" && "bg-red-400",
            variant === "warning" && "bg-amber-400",
            (!variant || variant === "default") && "bg-primary",
            variant === "secondary" && "bg-muted-foreground",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
