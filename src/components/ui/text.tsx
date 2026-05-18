import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-base leading-relaxed text-foreground",
      bodySm: "text-sm leading-normal text-foreground",
      caption: "text-xs leading-normal text-muted-foreground",
      lead: "text-lg text-muted-foreground",
      title: "text-lg font-semibold tracking-tight text-foreground",
      headline: "text-2xl font-semibold tracking-tight text-foreground",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
      primary: "text-primary",
    },
  },
  defaultVariants: {
    variant: "body",
    align: "left",
    tone: "default",
  },
});

type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4";

export type TextProps = Omit<React.HTMLAttributes<HTMLElement>, "color"> &
  VariantProps<typeof textVariants> & {
    /** Default `p`; use `h2` etc. for headings. */
    as?: TextTag;
  };

/**
 * Typography wrapper for body copy, captions, and subheadings.
 * `cn` uses tailwind-merge to resolve conflicting color utilities.
 */
const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as = "p", className, variant, align, tone, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref as never}
        className={cn(textVariants({ variant, align, tone }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
