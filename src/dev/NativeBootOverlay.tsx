import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import type { AppspressoBootstrapPhase } from "@/hooks/useAppspressoBootstrap";
import { getDebugBuildInfo } from "@/dev/debug-actions";
import {
  getBootTraceSnapshot,
  isBootTraceEnabled,
} from "@/lib/boot-trace";
import { isNativeDebugEnabled } from "@/lib/native-debug";

export type NativeBootOverlayProps = {
  phase: AppspressoBootstrapPhase;
  error: string | null;
  startedAt: number;
};

/** On-screen boot timeline when `VITE_NATIVE_DEBUG` or `VITE_BOOT_TRACE` is set. */
export function NativeBootOverlay({
  phase,
  error,
  startedAt,
}: NativeBootOverlayProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [trace, setTrace] = useState(getBootTraceSnapshot);

  useEffect(() => {
    if (phase === "ready" || phase === "failed") return;
    const id = window.setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startedAt));
      if (isBootTraceEnabled()) setTrace(getBootTraceSnapshot());
    }, 250);
    return () => window.clearInterval(id);
  }, [startedAt, phase]);

  if (!isNativeDebugEnabled() && !isBootTraceEnabled()) return null;
  if (!Capacitor.isNativePlatform()) return null;
  // Boot timeline is for splash/bootstrap only — hide on main app (saves WebView work).
  if (phase === "ready") return null;

  const info = getDebugBuildInfo();
  const splashPlugin = Capacitor.isPluginAvailable("SplashScreen");
  const recent = trace.entries.slice(-4);

  return (
    <div
      className="pointer-events-none fixed left-2 top-2 z-[120] max-w-[min(92vw,22rem)] rounded border border-border/80 bg-background/95 p-2 font-mono text-[10px] leading-snug text-muted-foreground shadow-sm backdrop-blur-sm"
      aria-hidden
    >
      <div className="font-semibold text-foreground">boot debug</div>
      <div>phase: {phase}</div>
      <div>step: {trace.lastStep}</div>
      <div>elapsed: {elapsedMs}ms (trace {trace.elapsedMs}ms)</div>
      <div>platform: {info.platform}</div>
      <div>splash-plugin: {splashPlugin ? "yes" : "no"}</div>
      {recent.length > 0 ? (
        <div className="mt-1 max-h-24 overflow-hidden border-t border-border/60 pt-1">
          {recent.map((e) => (
            <div key={`${e.t}-${e.step}`} className="truncate">
              +{e.t} {e.step}
            </div>
          ))}
        </div>
      ) : null}
      {error ? <div className="text-destructive">err: {error}</div> : null}
      <div className="mt-1 text-[9px] opacity-70">
        logcat: adb logcat | grep APSPRESSO_BOOT
      </div>
    </div>
  );
}
