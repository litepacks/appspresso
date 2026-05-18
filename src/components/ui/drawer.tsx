/**
 * Drawer (side panel) — same behavior as [`Sheet`](./sheet.tsx); common “Drawer” API names.
 * - `layout="panel"`: floating card (default).
 * - `layout="nav"`: Slack-style full-height side nav + profile header / grouped items.
 * For **bottom sheet**, use [`AppModal`](./app-modal.tsx) `variant="sheet"`.
 */
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Drawer = Sheet;
const DrawerTrigger = SheetTrigger;
const DrawerClose = SheetClose;
const DrawerHeader = SheetHeader;
const DrawerTitle = SheetTitle;
const DrawerOverlay = SheetOverlay;
const DrawerPortal = SheetPortal;

export type DrawerContentWidth =
  | "default"
  | "sm"
  | "lg"
  | "xl"
  | "2xl"
  | "full";

/** `panel` = padded card; `nav` = full-height Slack-style menu from the edge. */
export type DrawerLayout = "panel" | "nav";

const DRAWER_CONTENT_WIDTH_CLASS: Record<DrawerContentWidth, string> = {
  default: "max-w-md",
  sm: "max-w-sm",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

const DRAWER_NAV_WIDTH_CLASS: Record<
  Exclude<DrawerContentWidth, "full"> | "nav",
  string
> = {
  nav: "max-w-[min(100vw,20rem)]",
  default: "max-w-[min(100vw,20rem)]",
  sm: "max-w-[min(100vw,18rem)]",
  lg: "max-w-[min(100vw,22rem)]",
  xl: "max-w-[min(100vw,24rem)]",
  "2xl": "max-w-[min(100vw,26rem)]",
};

type DrawerContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof SheetContent>,
  "className"
> & {
  className?: string;
  contentWidth?: DrawerContentWidth;
  layout?: DrawerLayout;
  /** top-right ✕ when `layout="nav"` (default: hidden). */
  showCloseButton?: boolean;
};

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  (
    {
      className,
      side = "right",
      contentWidth = "default",
      layout = "panel",
      showCloseButton,
      ...props
    },
    ref,
  ) => {
    const isNav = layout === "nav";
    const hideClose = showCloseButton === false || (isNav && showCloseButton !== true);

    return (
      <SheetContent
        ref={ref}
        side={side}
        data-layout={layout}
        className={cn(
          isNav
            ? [
                "top-0 bottom-0 flex h-dvh max-h-dvh flex-col overflow-hidden rounded-none border-y-0 p-0 shadow-xl",
                side === "right"
                  ? "right-0 border-r left-auto"
                  : "left-0 border-l right-auto",
                contentWidth === "full"
                  ? "max-w-full"
                  : DRAWER_NAV_WIDTH_CLASS[contentWidth] ??
                      DRAWER_NAV_WIDTH_CLASS.nav,
                hideClose && "[&>button.absolute]:hidden",
              ]
            : [
                "top-[calc(0.75rem+env(safe-area-inset-top,0px))] bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] h-auto max-h-none overflow-y-auto rounded-2xl",
                DRAWER_CONTENT_WIDTH_CLASS[contentWidth],
                side === "right"
                  ? "right-[max(0.5rem,env(safe-area-inset-right,0px))]"
                  : "left-[max(0.5rem,env(safe-area-inset-left,0px))]",
              ],
          className,
        )}
        {...props}
      />
    );
  },
);
DrawerContent.displayName = "DrawerContent";

/** `layout="nav"` content: scrollable menu body. */
const DrawerNavBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-h-0 flex-1 flex-col overflow-y-auto pb-6",
      className,
    )}
    {...props}
  />
));
DrawerNavBody.displayName = "DrawerNavBody";

type DrawerProfileHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  avatar?: React.ReactNode;
};

/** Slack-style top profile row (avatar + title + subtitle). */
const DrawerProfileHeader = React.forwardRef<
  HTMLDivElement,
  DrawerProfileHeaderProps
>(({ className, title, subtitle, avatar, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 border-border/60 border-b px-4 py-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]",
      className,
    )}
    {...props}
  >
    {avatar ? (
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {avatar}
      </div>
    ) : null}
    <div className="min-w-0 flex-1">
      <div className="truncate font-semibold text-base leading-tight">{title}</div>
      {subtitle ? (
        <div className="truncate text-muted-foreground text-sm leading-snug">
          {subtitle}
        </div>
      ) : null}
    </div>
  </div>
));
DrawerProfileHeader.displayName = "DrawerProfileHeader";

const DrawerMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("my-2 h-px bg-border/80", className)}
    {...props}
  />
));
DrawerMenuSeparator.displayName = "DrawerMenuSeparator";

const DrawerMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col py-1", className)} {...props} />
));
DrawerMenuGroup.displayName = "DrawerMenuGroup";

type DrawerMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  asChild?: boolean;
};

const DrawerMenuItem = React.forwardRef<HTMLButtonElement, DrawerMenuItemProps>(
  ({ className, icon, children, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[17px] text-foreground leading-snug transition-colors",
          "hover:bg-muted/60 active:bg-muted/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span className="flex size-6 shrink-0 items-center justify-center [&>svg]:size-6">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
      </Comp>
    );
  },
);
DrawerMenuItem.displayName = "DrawerMenuItem";

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex flex-col-reverse gap-2 border-border/80 border-t px-6 pt-4 pb-6",
      className,
    )}
    {...props}
  />
));
DrawerFooter.displayName = "DrawerFooter";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground text-sm leading-relaxed", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuSeparator,
  DrawerNavBody,
  DrawerOverlay,
  DrawerPortal,
  DrawerProfileHeader,
  DrawerTitle,
  DrawerTrigger,
};
