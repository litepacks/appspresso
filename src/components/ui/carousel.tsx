import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CarouselContextValue = {
  selectedIndex: number;
  itemCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  setItemCount: (n: number) => void;
  onViewportScroll: () => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function scrollElementTo(
  el: HTMLDivElement,
  left: number,
  behavior: ScrollBehavior,
) {
  if (typeof el.scrollTo === "function") {
    try {
      el.scrollTo({ left, behavior });
      return;
    } catch {
      /* some test environments */
    }
  }
  el.scrollLeft = left;
}

function useCarouselContext(component: string): CarouselContextValue {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Carousel>`);
  }
  return ctx;
}

/**
 * For custom controls outside compound carousel (e.g. dot indicators).
 */
export function useCarousel(): CarouselContextValue {
  return useCarouselContext("useCarousel");
}

export type CarouselProps = React.HTMLAttributes<HTMLElement> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
};

/**
 * Horizontal scroll-snap carousel. No extra deps; touch scroll and arrow buttons with `scroll-smooth`.
 */
export function Carousel({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  className,
  children,
  "aria-label": ariaLabel = "Carousel",
  ...props
}: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const isControlled = valueProp !== undefined;
  const [internalIndex, setInternalIndex] = React.useState(defaultValue);
  const selectedIndex = isControlled ? (valueProp as number) : internalIndex;
  const selectedIndexRef = React.useRef(selectedIndex);
  const [itemCount, setItemCount] = React.useState(0);

  React.useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const setIndex = React.useCallback(
    (next: number) => {
      const maxIdx = Math.max(0, itemCount - 1);
      const clamped = Math.max(0, Math.min(maxIdx, next));
      if (!isControlled) {
        setInternalIndex(clamped);
      }
      onValueChange?.(clamped);
    },
    [isControlled, itemCount, onValueChange],
  );

  const getStride = React.useCallback((): number => {
    const root = viewportRef.current;
    if (!root) return 0;
    const track = root.firstElementChild as HTMLElement | null;
    const slide = track?.firstElementChild as HTMLElement | null;
    if (!slide) return 0;
    const gapRaw = track
      ? getComputedStyle(track).columnGap || getComputedStyle(track).gap
      : "0";
    const gap = Number.parseFloat(gapRaw) || 0;
    return slide.offsetWidth + gap;
  }, []);

  const scrollTo = React.useCallback(
    (index: number) => {
      const root = viewportRef.current;
      const stride = getStride();
      if (!root || stride <= 0 || itemCount < 1) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      scrollElementTo(root, clamped * stride, "smooth");
      setIndex(clamped);
    },
    [getStride, itemCount, setIndex],
  );

  const scrollPrev = React.useCallback(() => {
    scrollTo(selectedIndexRef.current - 1);
  }, [scrollTo]);

  const scrollNext = React.useCallback(() => {
    scrollTo(selectedIndexRef.current + 1);
  }, [scrollTo]);

  const rafRef = React.useRef<number | null>(null);
  const onViewportScroll = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const root = viewportRef.current;
      const stride = getStride();
      if (!root || stride <= 0 || itemCount < 1) return;
      const idx = Math.round(root.scrollLeft / stride);
      const clamped = Math.max(0, Math.min(itemCount - 1, idx));
      if (clamped !== selectedIndexRef.current) {
        setIndex(clamped);
      }
    });
  }, [getStride, itemCount, setIndex]);

  React.useEffect(() => {
    if (!isControlled || valueProp === undefined) return;
    const root = viewportRef.current;
    const stride = getStride();
    if (!root || stride <= 0 || itemCount < 1) return;
    const target = Math.max(0, Math.min(itemCount - 1, valueProp));
    const targetLeft = target * stride;
    if (Math.abs(root.scrollLeft - targetLeft) > 1) {
      scrollElementTo(root, targetLeft, "auto");
    }
  }, [getStride, isControlled, itemCount, valueProp]);

  const canScrollPrev = itemCount > 0 && selectedIndex > 0;
  const canScrollNext = itemCount > 0 && selectedIndex < itemCount - 1;

  const contextValue = React.useMemo(
    () =>
      ({
        selectedIndex,
        itemCount,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        scrollTo,
        viewportRef,
        setItemCount,
        onViewportScroll,
      }) satisfies CarouselContextValue,
    [
      selectedIndex,
      itemCount,
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
      scrollTo,
      onViewportScroll,
    ],
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <section
        className={cn("relative w-full", className)}
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export type CarouselContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Inner flex row: gap between slides via `gap-*` (stride included in calculation) */
  innerClassName?: string;
};

export const CarouselContent = ({
  children,
  className,
  innerClassName,
  onScroll,
  ...props
}: CarouselContentProps) => {
  const { viewportRef, onViewportScroll, setItemCount } =
    useCarouselContext("CarouselContent");

  const { onKeyDown: _omitCarouselKeys, ...restDivProps } = props;

  const count = React.useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement).length,
    [children],
  );

  React.useLayoutEffect(() => {
    setItemCount(count);
  }, [count, setItemCount]);

  return (
    <div
      ref={viewportRef}
      className={cn(
        "w-full min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth outline-none",
        "snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]",
        "[&::-webkit-scrollbar]:hidden",
        className,
      )}
      onScroll={(e) => {
        onViewportScroll();
        onScroll?.(e);
      }}
      {...restDivProps}
    >
      <div className={cn("flex flex-row", innerClassName)}>{children}</div>
    </div>
  );
};

CarouselContent.displayName = "CarouselContent";

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

export const CarouselItem = ({ className, ...props }: CarouselItemProps) => (
  <div
    className={cn("min-w-0 shrink-0 grow-0 basis-full snap-start", className)}
    {...props}
  />
);

CarouselItem.displayName = "CarouselItem";

export type CarouselPreviousProps = React.ComponentProps<typeof Button>;

export const CarouselPrevious = ({
  className,
  variant = "outline",
  size = "icon",
  children,
  onKeyDown,
  ...props
}: CarouselPreviousProps) => {
  const { canScrollPrev, scrollPrev } = useCarouselContext("CarouselPrevious");
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      onClick={scrollPrev}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollPrev();
        }
      }}
      {...props}
    >
      {children ?? <ChevronLeftIcon className="h-5 w-5" aria-hidden />}
    </Button>
  );
};

CarouselPrevious.displayName = "CarouselPrevious";

export type CarouselNextProps = React.ComponentProps<typeof Button>;

export const CarouselNext = ({
  className,
  variant = "outline",
  size = "icon",
  children,
  onKeyDown,
  ...props
}: CarouselNextProps) => {
  const { canScrollNext, scrollNext } = useCarouselContext("CarouselNext");
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!canScrollNext}
      aria-label="Next slide"
      onClick={scrollNext}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollNext();
        }
      }}
      {...props}
    >
      {children ?? <ChevronRightIcon className="h-5 w-5" aria-hidden />}
    </Button>
  );
};

CarouselNext.displayName = "CarouselNext";
