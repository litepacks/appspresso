import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import {
  applySplashDocumentBackground,
  getSplashBootstrapTiming,
  SPLASH_NATIVE_FALLBACK_HIDE_MS,
} from "@/lib/splash-bootstrap";

applySplashDocumentBackground();

/**
 * Import as first side effect in host `main.tsx`.
 * Native splash is not hidden here immediately; after `BootstrapLoadingScreen` mounts
 * smooth transition via `hideSplashScreen` to web bootstrap.
 * Long-term fallback hide only if JS never boots (e.g. import error).
 */
if (Capacitor.isNativePlatform()) {
  const { nativeFadeOutMs } = getSplashBootstrapTiming();
  setTimeout(() => {
    void SplashScreen.hide({ fadeOutDuration: nativeFadeOutMs }).catch(
      () => {},
    );
  }, SPLASH_NATIVE_FALLBACK_HIDE_MS);
}
