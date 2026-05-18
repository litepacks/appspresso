import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fabSlotVariants = cva(
  "pointer-events-none fixed z-50 flex max-w-[100vw]",
  {
    variants: {
      horizontal: {
        start: "",
        end: "",
        center: "",
      },
      vertical: {
        bottom: "",
        top: "",
      },
    },
    compoundVariants: [
      {
        horizontal: "start",
        vertical: "bottom",
        class: "bottom-0 left-0 justify-start pl-4",
      },
      {
        horizontal: "end",
        vertical: "bottom",
        class: "bottom-0 right-0 justify-end pr-4",
      },
      {
        horizontal: "center",
        vertical: "bottom",
        class: "bottom-0 left-1/2 -translate-x-1/2 justify-center",
      },
      {
        horizontal: "start",
        vertical: "top",
        class:
          "left-0 top-0 justify-start pl-4 pt-[max(1rem,env(safe-area-inset-top,0px))]",
      },
      {
        horizontal: "end",
        vertical: "top",
        class:
          "right-0 top-0 justify-end pr-4 pt-[max(1rem,env(safe-area-inset-top,0px))]",
      },
      {
        horizontal: "center",
        vertical: "top",
        class:
          "left-1/2 top-0 -translate-x-1/2 justify-center pt-[max(1rem,env(safe-area-inset-top,0px))]",
      },
    ],
    defaultVariants: {
      horizontal: "end",
      vertical: "bottom",
    },
  },
);

const fabShapeVariants = cva("pointer-events-auto rounded-full shadow-lg", {
  variants: {
    layout: {
      icon: "size-14 min-h-14 min-w-14 shrink-0 p-0",
      extended: "h-14 min-h-14 gap-2 px-5",
    },
  },
  defaultVariants: { layout: "icon" },
});

export type FabClearance = "default" | "bottomNavigation";

export type FabProps = Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof fabSlotVariants> &
  VariantProps<typeof fabShapeVariants> & {
    /**
     * FAB bottom inset when fixed bottom `nav` / tab bar (`AppBottomTabShell`, etc.) is present.
     * `bottomNavigation`: ~tab row + safe area + small margin.
     */
    clearance?: FabClearance;
  };

const fabBottomPadding: Record<FabClearance, string> = {
  default: "pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
  bottomNavigation: "pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)]",
};

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  (
    {
      className,
      horizontal,
      vertical,
      layout,
      clearance = "default",
      variant = "default",
      children,
      ...props
    },
    ref,
  ) => {
    const verticalAxis = vertical ?? "bottom";

    return (
      <div
        className={cn(
          fabSlotVariants({ horizontal, vertical }),
          verticalAxis === "bottom" ? fabBottomPadding[clearance] : null,
        )}
        data-fab-root
      >
        <Button
          ref={ref}
          variant={variant}
          size={layout === "extended" ? "lg" : "icon"}
          className={cn(fabShapeVariants({ layout }), className)}
          {...props}
        >
          {children}
        </Button>
      </div>
    );
  },
);
Fab.displayName = "Fab";

export { Fab, fabShapeVariants, fabSlotVariants };
