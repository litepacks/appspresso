import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ionic-style horizontal segment (single select). Accessibility: Radix RadioGroup.
 */
const Segment = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, orientation = "horizontal", disabled, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    disabled={disabled}
    orientation={orientation}
    className={cn(
      "flex w-full gap-0 rounded-full bg-muted p-0.5",
      orientation === "horizontal" ? "flex-row" : "flex-col",
      disabled && "pointer-events-none opacity-50",
      className,
    )}
    {...props}
  />
));
Segment.displayName = "Segment";

const SegmentItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "flex min-h-9 min-w-0 flex-1 shrink-0 items-center justify-center rounded-full px-3 py-2 text-center text-sm font-medium leading-none text-foreground outline-none transition-[color,box-shadow,background-color]",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=unchecked]:bg-transparent data-[state=unchecked]:shadow-none",
      "data-[state=checked]:bg-background data-[state=checked]:shadow-sm",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </RadioGroupPrimitive.Item>
));
SegmentItem.displayName = "SegmentItem";

export { Segment, SegmentItem };
