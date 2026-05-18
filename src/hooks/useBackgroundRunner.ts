import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";
import {
  type BackgroundRunnerDispatchOptions,
  dispatchBackgroundRunnerEvent,
  isBackgroundRunnerAvailable,
} from "@/services/background-runner.service";

export type UseBackgroundRunnerResult = {
  /** Native + plugin installed. */
  available: boolean;
  isNative: boolean;
  dispatch: (options: BackgroundRunnerDispatchOptions) => Promise<unknown>;
};

/**
 * Capacitor Background Runner — configured via `appspresso.config` → `plugins.BackgroundRunner`.
 * `available` false on web; demo playground uses manual `dispatchEvent`.
 */
export function useBackgroundRunner(): UseBackgroundRunnerResult {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void isBackgroundRunnerAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dispatch = useCallback(
    (options: BackgroundRunnerDispatchOptions) =>
      dispatchBackgroundRunnerEvent(options),
    [],
  );

  return {
    available,
    isNative: Capacitor.isNativePlatform(),
    dispatch,
  };
}
