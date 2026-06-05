import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { AppspressoBootstrapPhase } from "@/hooks/useAppspressoBootstrap";
import {
  BOOTSTRAP_FORCE_HIDE_SPLASH_MS,
  BOOTSTRAP_STUCK_UI_MS,
} from "@/lib/bootstrap-timing";
import { isNativeDebugEnabled } from "@/lib/native-debug";
import { hideSplashScreen } from "@/services/appearance.service";

export type BootstrapStuckDetectorProps = {
  phase: AppspressoBootstrapPhase;
  error: string | null;
  startedAt: number;
};

/**
 * Minimal recovery UI when bootstrap stays in `loading` too long.
 * Always mounted (low overhead); details only when native debug is enabled.
 */
export function BootstrapStuckDetector({
  phase,
  error,
  startedAt,
}: BootstrapStuckDetectorProps) {
  const { t } = useTranslation();
  const [elapsedSec, setElapsedSec] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (phase !== "loading") {
      setVisible(false);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);
      setElapsedSec(elapsed);
      setVisible(elapsed * 1000 >= BOOTSTRAP_STUCK_UI_MS);
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(() => {
      void hideSplashScreen();
    }, BOOTSTRAP_FORCE_HIDE_SPLASH_MS);
    return () => window.clearTimeout(id);
  }, [phase, startedAt]);

  if (!visible || phase !== "loading") return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[110] flex flex-col items-center gap-2 border-t border-border bg-background/95 px-4 py-3 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">
        {t(
          "bootstrap.stuckStarting",
          "Still starting… ({{seconds}}s)",
          { seconds: elapsedSec },
        )}
      </p>
      {isNativeDebugEnabled() && error ? (
        <pre className="max-h-20 max-w-full overflow-auto text-left text-xs text-muted-foreground">
          {error}
        </pre>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => window.location.reload()}
      >
        {t("bootstrap.reload", "Reload app")}
      </Button>
    </div>
  );
}
