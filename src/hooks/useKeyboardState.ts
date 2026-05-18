import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

export type KeyboardState = {
  /** Soft keyboard likely visible */
  isOpen: boolean;
  /** Estimated height (px); 0 if unknown */
  height: number;
};

export type UseKeyboardStateOptions = {
  /**
   * When `false`, no listener; use in `AppBottomTabShell` etc. to save battery / avoid triggers
   * when the feature is off.
   */
  enabled?: boolean;
};

const OVERLAP_THRESHOLD_PX = 72;

/**
 * Web: `visualViewport` shrink; native: `@capacitor/keyboard` events (falls back to web).
 */
export function useKeyboardState(
  options?: UseKeyboardStateOptions,
): KeyboardState {
  const enabled = options?.enabled !== false;
  const [state, setState] = useState<KeyboardState>({
    isOpen: false,
    height: 0,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const attachVisualViewport = (): (() => void) => {
      const vv = window.visualViewport;
      if (!vv) {
        return () => {};
      }
      const update = () => {
        const overlap = Math.max(
          0,
          window.innerHeight - vv.height - vv.offsetTop,
        );
        const open = overlap > OVERLAP_THRESHOLD_PX;
        setState({ isOpen: open, height: open ? overlap : 0 });
      };
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
      update();
      return () => {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      };
    };

    void (async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { Keyboard } = await import("@capacitor/keyboard");
          if (cancelled) {
            return;
          }
          const hShow = await Keyboard.addListener("keyboardDidShow", (e) => {
            setState({ isOpen: true, height: e.keyboardHeight });
          });
          const hHide = await Keyboard.addListener("keyboardDidHide", () => {
            setState({ isOpen: false, height: 0 });
          });
          if (cancelled) {
            void hShow.remove();
            void hHide.remove();
            return;
          }
          cleanup = () => {
            void hShow.remove();
            void hHide.remove();
          };
          return;
        } catch {
          /* no package or external bundle: visualViewport */
        }
      }
      if (cancelled) {
        return;
      }
      cleanup = attachVisualViewport();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setState({ isOpen: false, height: 0 });
    }
  }, [enabled]);

  return enabled ? state : { isOpen: false, height: 0 };
}
