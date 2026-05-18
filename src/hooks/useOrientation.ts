import { useEffect, useMemo, useState } from "react";
import { appspressoPackageConfig } from "@/config/appspresso.config";
import {
  getOrientationSnapshot,
  type OrientationSnapshot,
} from "@/lib/orientation";

function subscribeOrientation(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const on = () => {
    onChange();
  };

  window.addEventListener("resize", on);
  window.addEventListener("orientationchange", on);

  const so = typeof screen !== "undefined" ? screen.orientation : undefined;
  so?.addEventListener?.("change", on);

  return () => {
    window.removeEventListener("resize", on);
    window.removeEventListener("orientationchange", on);
    so?.removeEventListener?.("change", on);
  };
}

export type UseOrientationOptions = {
  /**
   * Max width/height ratio for portrait; package config when omitted.
   */
  portraitMaxAspectRatio?: number;
};

/**
 * Window / screen orientation (`resize`, `orientationchange`, `screen.orientation` `change`).
 */
export function useOrientation(
  options?: UseOrientationOptions,
): OrientationSnapshot {
  const ratio = useMemo(
    () =>
      options?.portraitMaxAspectRatio ??
      appspressoPackageConfig.orientation.portraitMaxAspectRatio,
    [options?.portraitMaxAspectRatio],
  );

  const [state, setState] = useState<OrientationSnapshot>(() =>
    getOrientationSnapshot(ratio),
  );

  useEffect(() => {
    setState(getOrientationSnapshot(ratio));
    return subscribeOrientation(() => {
      setState(getOrientationSnapshot(ratio));
    });
  }, [ratio]);

  return state;
}
