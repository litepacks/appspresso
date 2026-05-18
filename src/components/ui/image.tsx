import type { ReactNode } from "react";
import * as React from "react";
import { AppModal } from "@/components/ui/app-modal";
import { cn } from "@/lib/utils";

/**
 * Default placeholder on network or local path errors (no external request).
 * `Image` tries this **automatically** when primary `src` fails; you rarely need to import it.
 * Provide only `fallbackSrc` for a custom image.
 */
export const DEFAULT_IMAGE_FALLBACK_SRC =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><rect fill="%23f4f4f5" width="800" height="600"/><g fill="none" stroke="%23a1a1aa" stroke-width="8" stroke-linecap="round"><rect x="240" y="180" width="320" height="240" rx="12"/><path d="M280 380 L400 280 L520 340 L560 300"/></g></svg>`,
  );

type ImageLoadPhase = "primary" | "fallback" | "broken";

export type ImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "children"
> & {
  src: string;
  /** Small / LQIP-style preview; shown until main image loads */
  previewSrc?: string;
  /**
   * Set `false` to disable preview when `previewSrc` is set.
   * @default true when previewSrc is defined.
   */
  showPreview?: boolean;
  /**
   * Used when primary `src` fails to load.
   * Falls back to {@link DEFAULT_IMAGE_FALLBACK_SRC} when omitted.
   */
  fallbackSrc?: string;
  /**
   * @default true — fits content width, proportional height (`max-w-full h-auto`).
   * Ignored when `fill` is used.
   */
  autoSize?: boolean;
  /**
   * Row width: `w-full h-auto`. Fixed-height box + `fit="cover"` is a common crop combo.
   * Meaningless with `fill`; `fill` takes precedence.
   */
  fullWidth?: boolean;
  /**
   * When using `fill`, defaults to `cover` if omitted; optional on plain images (`object-*`).
   */
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /**
   * `true`: image fills container with `absolute inset-0 size-full` (parent must be `relative` with size).
   */
  fill?: boolean;
  /** Outer wrapper classes when using preview / `fill` */
  wrapperClassName?: string;
  /**
   * Tap opens centered lightbox (`AppModal` `variant="centered"`).
   * Image centered via `grid place-items-center`; close via backdrop or Escape.
   * Title in top bar when not immersive; no X / zoom.
   * Disabled when `phase === "broken"`.
   */
  previewModal?: boolean;
  /** Modal title; falls back to `alt` */
  previewModalTitle?: ReactNode;
  /** URL shown in modal; falls back to `src` */
  previewModalSrc?: string;
  /** In-modal `object-fit`; default `contain` (fit within edges) */
  previewModalFit?: "contain" | "cover";
  /** Accessible trigger label */
  previewModalAriaLabel?: string;
  /** Lightbox backdrop overlay — e.g. `bg-black/70 backdrop-blur-2xl` */
  previewModalBackdropClassName?: string;
  /** Extra modal panel classes */
  previewModalSheetClassName?: string;
  /**
   * `true`: no title bar; no frame/shadow on image.
   * Close via backdrop tap or Escape (`AppModal`).
   */
  previewModalImmersive?: boolean;
};

const fitToClass: Record<NonNullable<ImageProps["fit"]>, string> = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      previewSrc,
      showPreview: showPreviewProp,
      fallbackSrc,
      autoSize = true,
      fullWidth = false,
      fit,
      fill = false,
      wrapperClassName,
      className,
      onLoad,
      onError,
      previewModal = false,
      previewModalTitle,
      previewModalSrc,
      previewModalFit = "contain",
      previewModalAriaLabel,
      previewModalBackdropClassName,
      previewModalSheetClassName,
      previewModalImmersive = false,
      ...props
    },
    ref,
  ) => {
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [modalImgStatus, setModalImgStatus] = React.useState<
      "loading" | "loaded" | "error"
    >("loading");

    const modalSrc = previewModalSrc ?? src;

    // biome-ignore lint/correctness/useExhaustiveDependencies: reload image when modalSrc changes while lightbox is open
    React.useEffect(() => {
      if (!lightboxOpen) return;
      setModalImgStatus("loading");
    }, [lightboxOpen, modalSrc]);

    const previewEnabled = Boolean(previewSrc) && (showPreviewProp ?? true);
    const needsWrapper = previewEnabled || fill;

    const [phase, setPhase] = React.useState<ImageLoadPhase>("primary");
    const [displaySrc, setDisplaySrc] = React.useState(src);
    const [mainLoaded, setMainLoaded] = React.useState(false);

    React.useEffect(() => {
      setPhase("primary");
      setDisplaySrc(src);
      setMainLoaded(false);
    }, [src]);

    const resolvedFit = fit ?? (fill ? "cover" : undefined);
    const fitClass = resolvedFit ? fitToClass[resolvedFit] : undefined;

    const handleMainLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setMainLoaded(true);
      onLoad?.(e);
    };

    const handleMainError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (phase === "primary") {
        setPhase("fallback");
        setDisplaySrc(fallbackSrc ?? DEFAULT_IMAGE_FALLBACK_SRC);
        setMainLoaded(false);
      } else {
        setPhase("broken");
      }
      onError?.(e);
    };

    const previewActive = previewEnabled && phase === "primary";

    const intrinsicBox = !fill && fullWidth && autoSize !== false;
    const inlineBox = !fill && !fullWidth && autoSize !== false;

    const imgClass = cn(
      fill && "absolute inset-0 size-full",
      intrinsicBox && "h-auto w-full max-w-none",
      inlineBox && "h-auto w-auto max-w-full",
      fitClass,
      previewActive && "relative z-[1]",
      previewActive &&
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
      previewActive && (mainLoaded ? "opacity-100" : "opacity-0"),
      className,
    );

    const previewLayerClass = cn(
      "pointer-events-none absolute inset-0 z-0 size-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none",
      mainLoaded ? "opacity-0" : "opacity-100",
      "scale-[1.02] blur-[2px]",
    );

    const shellClass = cn(
      "relative overflow-hidden",
      fill && "size-full min-h-0 min-w-0",
      intrinsicBox && "block w-full",
      inlineBox && "inline-block max-w-full",
      wrapperClassName,
    );

    if (phase === "broken") {
      return (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "flex min-h-[8rem] items-center justify-center rounded-xl border border-border/60 bg-muted text-muted-foreground text-xs",
            fill && "min-h-0 size-full",
            intrinsicBox && "w-full",
            inlineBox && "max-w-full",
            wrapperClassName,
            className,
          )}
        >
          <span className="px-2 text-center">{alt}</span>
        </div>
      );
    }

    const effectiveSrc = phase === "primary" ? src : displaySrc;

    const mainImg = (
      <img
        ref={ref}
        src={effectiveSrc}
        alt={alt}
        decoding="async"
        className={imgClass}
        onLoad={handleMainLoad}
        onError={handleMainError}
        {...props}
      />
    );

    const figure = needsWrapper ? (
      <div className={shellClass}>
        {previewActive ? (
          <img
            src={previewSrc}
            alt=""
            aria-hidden
            decoding="async"
            className={previewLayerClass}
          />
        ) : null}
        {mainImg}
      </div>
    ) : (
      mainImg
    );

    if (!previewModal) {
      return figure;
    }

    const triggerClass = cn(
      "touch-manipulation cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      fill && "h-full min-h-0 w-full",
      intrinsicBox && "block w-full",
      !fill && !intrinsicBox && "inline-block max-w-full",
    );

    const modalChromeLabel =
      typeof previewModalTitle === "string" && previewModalTitle
        ? previewModalTitle
        : alt;

    const closeLightbox = () => setLightboxOpen(false);

    return (
      <>
        <button
          type="button"
          className={triggerClass}
          aria-label={previewModalAriaLabel ?? "View larger image"}
          aria-haspopup="dialog"
          onClick={() => setLightboxOpen(true)}
        >
          {figure}
        </button>
        <AppModal
          variant="centered"
          showHandle={false}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          title={previewModalImmersive ? undefined : (previewModalTitle ?? alt)}
          showCloseButton={false}
          contentAriaLabel={
            previewModalImmersive ? modalChromeLabel : undefined
          }
          frameClassName={previewModalImmersive ? "p-0" : undefined}
          className="min-h-0 p-0"
          headerClassName="border-white/10 bg-black/40 text-primary-foreground backdrop-blur-md supports-[backdrop-filter]:bg-black/35"
          backdropClassName={previewModalBackdropClassName}
          sheetClassName={cn(
            previewModalImmersive
              ? "h-full min-h-dvh w-full max-w-none rounded-none border-0 bg-transparent shadow-none"
              : "max-h-[min(94dvh,calc(100dvh-1rem))] w-full max-w-[min(100vw-1rem,96rem)] bg-transparent border-0 shadow-none",
            previewModalSheetClassName,
          )}
        >
          <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
            <button
              type="button"
              aria-label="Close preview"
              className={cn(
                "grid min-h-0 w-full flex-1 cursor-default place-items-center overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
                "relative touch-pan-x touch-pan-y border-0 bg-transparent p-0 text-left",
                previewModalImmersive
                  ? "min-h-[100dvh] p-[max(0.5rem,env(safe-area-inset-top,0px))_max(0.5rem,env(safe-area-inset-right,0px))_max(0.5rem,env(safe-area-inset-bottom,0px))_max(0.5rem,env(safe-area-inset-left,0px))]"
                  : "min-h-[min(20rem,40dvh)] p-2 sm:p-3",
              )}
              onClick={closeLightbox}
            >
              {modalImgStatus === "error" ? (
                <div className="flex max-w-md flex-col items-center justify-center gap-2 px-4 text-center text-primary-foreground text-sm">
                  <span className="font-medium">Could not load image</span>
                  <span className="text-primary-foreground/80 text-xs">
                    Check your connection or try again later.
                  </span>
                </div>
              ) : (
                <img
                  src={modalSrc}
                  alt={alt}
                  decoding="async"
                  draggable={false}
                  fetchPriority="high"
                  onLoad={() => setModalImgStatus("loaded")}
                  onError={() => setModalImgStatus("error")}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={cn(
                    "max-w-full select-none object-contain motion-reduce:transition-none",
                    previewModalImmersive
                      ? "shadow-none ring-0"
                      : "rounded-xl shadow-2xl ring-1 ring-black/30 dark:ring-white/15",
                    previewModalFit === "cover" &&
                      "h-auto max-h-[min(85dvh,calc(100dvh-2rem))] w-full max-w-[min(92vw,calc(100vw-2rem))] object-cover",
                    previewModalFit === "contain" &&
                      "h-auto max-h-[min(85dvh,calc(100dvh-2rem))] w-auto max-w-[min(92vw,calc(100vw-2rem))] object-contain",
                  )}
                />
              )}
              {modalImgStatus === "loading" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25"
                >
                  <span className="sr-only">Loading image</span>
                  <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white"
                    aria-hidden
                  />
                </div>
              ) : null}
            </button>
          </div>
        </AppModal>
      </>
    );
  },
);
Image.displayName = "Image";

export { Image };
export default Image;
