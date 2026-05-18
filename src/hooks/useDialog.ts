import { Capacitor } from "@capacitor/core";
import {
  type AlertOptions,
  type ConfirmOptions,
  type ConfirmResult,
  Dialog,
  type PromptOptions,
  type PromptResult,
} from "@capacitor/dialog";
import { useCallback, useMemo, useState } from "react";

export type {
  AlertOptions,
  ConfirmOptions,
  ConfirmResult,
  PromptOptions,
  PromptResult,
} from "@capacitor/dialog";

function isDialogSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = Capacitor.getPlatform();
    return p === "ios" || p === "android" || p === "web";
  } catch {
    return false;
  }
}

export type UseDialogReturn = {
  /** Native or web (browser `alert` / `confirm` / `prompt`) */
  supported: boolean;
  /** Whether any dialog call is in progress */
  isPresenting: boolean;
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<ConfirmResult>;
  prompt: (options: PromptOptions) => Promise<PromptResult>;
};

/**
 * Thin wrapper for `@capacitor/dialog` (`alert`, `confirm`, `prompt`).
 * On web Capacitor uses `window.alert` / `confirm` / `prompt`.
 */
export function useDialog(): UseDialogReturn {
  const supported = useMemo(() => isDialogSupported(), []);
  const [isPresenting, setIsPresenting] = useState(false);

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    if (!isDialogSupported()) {
      throw new Error("Dialog is not available in this environment.");
    }
    setIsPresenting(true);
    try {
      return await fn();
    } finally {
      setIsPresenting(false);
    }
  }, []);

  const alertDialog = useCallback(
    (options: AlertOptions) => wrap(() => Dialog.alert(options)),
    [wrap],
  );

  const confirmDialog = useCallback(
    (options: ConfirmOptions) => wrap(() => Dialog.confirm(options)),
    [wrap],
  );

  const promptDialog = useCallback(
    (options: PromptOptions) => wrap(() => Dialog.prompt(options)),
    [wrap],
  );

  return {
    supported,
    isPresenting,
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
  };
}
