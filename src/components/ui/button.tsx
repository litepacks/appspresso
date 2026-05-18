import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input/80 bg-background shadow-sm hover:bg-accent",
        ghost: "font-medium hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** Props accepted by a router-style link (e.g. react-router `Link`). */
export type ButtonLinkComponentProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string;
  };

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "href"
> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** When set, renders a link with the same styles. Use `linkComponent` for SPA routers. */
    to?: string;
    linkComponent?: React.ComponentType<
      React.PropsWithChildren<ButtonLinkComponentProps>
    >;
  };

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      type = "button",
      to,
      linkComponent: LinkComponent,
      disabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const mergedClass = cn(buttonVariants({ variant, size }), className);

    if (to !== undefined && to !== "") {
      const anchorRest =
        rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      const linkClassName = cn(
        mergedClass,
        disabled && "pointer-events-none opacity-50",
      );
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        anchorRest.onClick?.(e);
      };
      const linkProps = {
        ...anchorRest,
        ref: ref as React.Ref<HTMLAnchorElement>,
        className: linkClassName,
        "aria-disabled": disabled ? true : undefined,
        ...(disabled ? { tabIndex: -1 as const } : {}),
        onClick: handleClick,
      };

      if (LinkComponent) {
        return (
          <LinkComponent to={to} {...linkProps}>
            {children}
          </LinkComponent>
        );
      }

      return (
        <a href={to} {...linkProps}>
          {children}
        </a>
      );
    }

    if (asChild) {
      if (!React.isValidElement(children)) {
        throw new TypeError(
          "Button asChild requires a single React element child",
        );
      }
      const child = children as React.ReactElement<{
        className?: string;
        ref?: React.Ref<HTMLElement>;
      }>;
      return React.cloneElement(child, {
        ...child.props,
        ...rest,
        className: cn(mergedClass, child.props.className),
        ref: mergeRefs<HTMLElement>(
          ref as React.Ref<HTMLElement>,
          child.props.ref,
        ),
      });
    }

    return (
      <button
        className={mergedClass}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
