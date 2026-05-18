import { ChevronDownIcon } from "@heroicons/react/24/outline";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type AccordionDisplay = NonNullable<
  VariantProps<typeof accordionItemVariants>["variant"]
>;

const AccordionDisplayContext = React.createContext<AccordionDisplay>("card");

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      flush: "border-border border-b last:border-b-0",
      card: "mb-2 overflow-hidden rounded-lg border border-border bg-card last:mb-0",
    },
  },
  defaultVariants: { variant: "card" },
});

const accordionTriggerVariants = cva(
  "flex w-full flex-1 items-center justify-between py-4 text-left text-sm font-medium outline-none transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
  {
    variants: {
      variant: {
        flush: "px-1",
        card: "px-4",
      },
    },
    defaultVariants: { variant: "card" },
  },
);

const accordionContentVariants = cva(
  "overflow-hidden text-muted-foreground text-sm",
  {
    variants: {
      variant: {
        flush: "px-1 pb-4",
        card: "px-4 pb-4",
      },
    },
    defaultVariants: { variant: "card" },
  },
);

function useAccordionDisplay(): AccordionDisplay {
  return React.useContext(AccordionDisplayContext);
}

type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
> &
  VariantProps<typeof accordionItemVariants>;

const Accordion = ({
  className,
  variant = "card",
  ...props
}: AccordionProps) => (
  <AccordionDisplayContext.Provider value={variant ?? "card"}>
    <AccordionPrimitive.Root className={cn("w-full", className)} {...props} />
  </AccordionDisplayContext.Provider>
);
Accordion.displayName = "Accordion";

type AccordionItemProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
>;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => {
  const display = useAccordionDisplay();
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant: display }), className)}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
>;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  const display = useAccordionDisplay();
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          accordionTriggerVariants({ variant: display }),
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
          aria-hidden
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
>;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
  const display = useAccordionDisplay();
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(accordionContentVariants({ variant: display }), className)}
      {...props}
    >
      <div className="pt-0">{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  accordionContentVariants,
  accordionItemVariants,
  accordionTriggerVariants,
};
