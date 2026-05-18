import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const listVariants = cva("flex min-w-0 flex-col p-0 [&>li]:min-w-0", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    },
    ordered: {
      true: "list-decimal ps-5",
      false: "list-none",
    },
  },
  defaultVariants: {
    gap: "sm",
    ordered: false,
  },
});

export type ListProps = React.ComponentPropsWithoutRef<"ul"> &
  VariantProps<typeof listVariants> & {
    /** Renders `<ol>` with decimal markers instead of an unstyled `<ul>`. */
    ordered?: boolean;
  };

const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ className, gap, ordered = false, ...props }, ref) => {
    const cls = cn(listVariants({ gap, ordered }), className);
    if (ordered) {
      return (
        <ol
          ref={ref as React.Ref<HTMLOListElement>}
          className={cls}
          {...props}
        />
      );
    }
    return (
      <ul ref={ref as React.Ref<HTMLUListElement>} className={cls} {...props} />
    );
  },
);
List.displayName = "List";

export type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn(className)} {...props} />
  ),
);
ListItem.displayName = "ListItem";

export { List, ListItem };
