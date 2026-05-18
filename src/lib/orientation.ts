import { appspressoPackageConfig } from "@/config/appspresso.config";

export type OrientationKind = "portrait" | "landscape";

export type OrientationSnapshot = {
  kind: OrientationKind;
  isPortrait: boolean;
  isLandscape: boolean;
  /** `ScreenOrientation.angle` (degrees); `null` if API missing or unknown */
  angle: number | null;
  /** E.g. `portrait-primary` */
  type: string | null;
};

/**
 * Instant orientation: `(orientation: portrait)` media query first, else `innerWidth/innerHeight` threshold
 * (`appspressoPackageConfig.orientation.portraitMaxAspectRatio`).
 */
export function getOrientationSnapshot(
  portraitMaxAspectRatio: number = appspressoPackageConfig.orientation
    .portraitMaxAspectRatio,
): OrientationSnapshot {
  if (typeof window === "undefined") {
    return {
      kind: "portrait",
      isPortrait: true,
      isLandscape: false,
      angle: null,
      type: null,
    };
  }

  let kind: OrientationKind;

  const mq = window.matchMedia?.("(orientation: portrait)");
  if (mq != null) {
    kind = mq.matches ? "portrait" : "landscape";
  } else {
    const w = window.innerWidth;
    const h = window.innerHeight;
    kind = h > 0 && w / h <= portraitMaxAspectRatio ? "portrait" : "landscape";
  }

  const so = typeof screen !== "undefined" ? screen.orientation : undefined;
  const angle =
    so != null &&
    typeof so.angle === "number" &&
    !Number.isNaN(so.angle) &&
    Number.isFinite(so.angle)
      ? so.angle
      : null;
  const type =
    so?.type != null && String(so.type).length > 0 ? String(so.type) : null;

  return {
    kind,
    isPortrait: kind === "portrait",
    isLandscape: kind === "landscape",
    angle,
    type,
  };
}
