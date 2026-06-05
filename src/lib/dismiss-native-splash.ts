import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import {
  applySplashDocumentBackground,
  SPLASH_NATIVE_FALLBACK_HIDE_MS,
} from "@/lib/splash-bootstrap";
import { bootTrace } from "@/lib/boot-trace";

applySplashDocumentBackground();
bootTrace("entry.dismiss-native-splash.loaded", {
  platform: Capacitor.getPlatform(),
});

function hideNativeSplashFallback(): void {
  if (!Capacitor.isNativePlatform()) return;
  if (!Capacitor.isPluginAvailable("SplashScreen")) return;
  bootTrace("native.splash.fallback-hide");
  void SplashScreen.hide().catch(() => {});
}

/**
 * Import as first side effect in host `main.tsx`.
 * Native splash is not hidden here immediately; after `BootstrapLoadingScreen` mounts
 * smooth transition via `hideSplashScreen` to web bootstrap.
 * Long-term fallback hide only if JS never boots (e.g. import error).
 */
if (Capacitor.isNativePlatform()) {
  bootTrace("native.splash.fallback-scheduled", {
    ms: SPLASH_NATIVE_FALLBACK_HIDE_MS,
  });
  setTimeout(hideNativeSplashFallback, SPLASH_NATIVE_FALLBACK_HIDE_MS);
}
