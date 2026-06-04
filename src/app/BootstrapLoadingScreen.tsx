import { Capacitor } from "@capacitor/core";
import { BootstrapLoadingScreenNative } from "@/app/BootstrapLoadingScreenNative";
import { BootstrapLoadingScreenWeb } from "@/app/BootstrapLoadingScreenWeb";

export type BootstrapLoadingScreenProps = {
  /** Transition animation to main app when `useAppspressoBootstrapPhase() === "exiting"`. */
  exiting?: boolean;
};

/**
 * Full-screen bootstrap / first paint loading UI.
 * Native: lightweight static UI (no Motion) to reduce WebView heap pressure.
 */
export function BootstrapLoadingScreen(props: BootstrapLoadingScreenProps) {
  if (Capacitor.isNativePlatform()) {
    return <BootstrapLoadingScreenNative {...props} />;
  }
  return <BootstrapLoadingScreenWeb {...props} />;
}
