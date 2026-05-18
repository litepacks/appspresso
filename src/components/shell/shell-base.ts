import { cva, type VariantProps } from "class-variance-authority";

/** Full-screen or embedded in parent flex chain (demo / inner layout) mode. */
export const appPageVariants = cva(
  "flex w-full flex-col overflow-hidden bg-background",
  {
    variants: {
      height: {
        /** Use with `flex-1 min-h-0` in `HostAppFrame` or `h-dvh` shell; tab bar stays at bottom. */
        viewport: "min-h-0 flex-1",
        contained: "min-h-0 flex-1",
      },
    },
    defaultVariants: { height: "viewport" },
  },
);

/** Semantic `<main>` in shell with top bar / bottom tabs: defers overflow to children. */
export const appMainVariants = cva(
  "flex min-h-0 flex-1 flex-col overflow-hidden",
);

/**
 * Full-height column inside `<main>` (e.g. `AnimatedOutlet` or nested shell).
 * Scrolling is usually on `AppContent` / `PullToRefresh`.
 */
export const appMainPaneVariants = cva(
  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
);

/** Sticky top bar: safe-area + minimum top inset when Android bar hidden + breathing room */
export const appHeaderVariants = cva(
  "sticky top-0 z-10 shrink-0 border-border border-b bg-background/95 pt-[calc(max(env(safe-area-inset-top,0px),1.5rem)+0.5rem)] backdrop-blur supports-[backdrop-filter]:bg-background/80",
);

/** Toolbar row: height and horizontal spacing from one place. */
export const appToolbarVariants = cva(
  "flex w-full shrink-0 items-center gap-2 px-3 sm:px-4",
  {
    variants: {
      density: {
        default: "min-h-14 py-2",
        compact: "min-h-12 py-1.5",
      },
    },
    defaultVariants: { density: "default" },
  },
);

export const appToolbarStartVariants = cva(
  "flex min-w-0 shrink-0 items-center gap-2",
);

export const appToolbarTitleVariants = cva(
  "min-w-0 flex-1 truncate text-center text-base font-semibold leading-none tracking-tight",
);

export const appToolbarEndVariants = cva(
  "flex min-w-0 shrink-0 items-center justify-end gap-2",
);

/** Main scrolling body. */
export const appContentVariants = cva(
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
  {
    variants: {
      padding: {
        none: "",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
      },
    },
    defaultVariants: { padding: "sm" },
  },
);

/** Bottom bar: safe-area bottom padding. */
export const appFooterVariants = cva(
  "shrink-0 border-border border-t bg-background pb-[env(safe-area-inset-bottom,0px)]",
);

export type AppPageHeight = NonNullable<
  VariantProps<typeof appPageVariants>["height"]
>;

export type AppToolbarDensity = NonNullable<
  VariantProps<typeof appToolbarVariants>["density"]
>;

export type AppContentPadding = NonNullable<
  VariantProps<typeof appContentVariants>["padding"]
>;
