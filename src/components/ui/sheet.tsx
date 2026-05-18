import { XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { createPortal } from "react-dom";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet(component: string): SheetContextValue {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Sheet>`);
  }
  return ctx;
}

function Sheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultOpen ?? false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internal;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!controlled) setInternal(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  return (
    <SheetContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
    asChild?: boolean;
    children: React.ReactNode;
    onClick?: React.MouseEventHandler;
  }
>(({ asChild, children, className, onClick, ...props }, ref) => {
  const { onOpenChange } = useSheet("SheetTrigger");
  const open = () => onOpenChange(true);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
      className?: string;
      ref?: React.Ref<HTMLElement>;
    }>;
    return React.cloneElement(child, {
      ...child.props,
      ...props,
      className: cn(className, child.props.className),
      ref: mergeRefs<HTMLElement>(
        ref as React.Ref<HTMLElement>,
        child.props.ref,
      ),
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        onClick?.(e);
        open();
      },
    });
  }
  return (
    <button
      type="button"
      ref={ref}
      className={className}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        open();
      }}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }
>(({ onClick, type = "button", children, ...props }, ref) => {
  const { onOpenChange } = useSheet("SheetClose");
  return (
    <button
      ref={ref}
      type={type}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
    >
      {children}
    </button>
  );
});
SheetClose.displayName = "SheetClose";

const SheetOverlay = ({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { onOpenChange } = useSheet("SheetOverlay");
  return (
    <button
      type="button"
      className={cn(
        "fixed inset-0 z-40 cursor-default border-0 bg-black/40 p-0",
        className,
      )}
      aria-label="Close panel"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
    />
  );
};

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "right" | "left";
    /** Accessible name (recommended if not using `SheetTitle`). */
    "aria-label"?: string;
  }
>(
  (
    { side = "right", className, children, "aria-label": ariaLabel, ...props },
    ref,
  ) => {
    const { open, onOpenChange } = useSheet("SheetContent");

    React.useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onOpenChange]);

    React.useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    if (!open) return null;
    if (typeof document === "undefined") return null;

    return createPortal(
      <>
        <SheetOverlay />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn(
            "fixed z-50 flex max-h-dvh w-full max-w-md flex-col border bg-background p-6 shadow-lg",
            "animate-in duration-300",
            side === "right"
              ? "right-0 top-0 h-full border-l slide-in-from-right"
              : "left-0 top-0 h-full border-r slide-in-from-left",
            className,
          )}
          {...props}
        >
          {children}
          <SheetClose
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </SheetClose>
        </div>
      </>,
      document.body,
    );
  },
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2 pb-4", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
