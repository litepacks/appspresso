import {
  ActionSheet,
  type ShowActionsOptions,
  type ShowActionsResult,
} from "@capacitor/action-sheet";
import { Capacitor } from "@capacitor/core";
import { useCallback, useMemo, useState } from "react";

export type {
  ShowActionsOptions,
  ShowActionsResult,
} from "@capacitor/action-sheet";
export { ActionSheetButtonStyle } from "@capacitor/action-sheet";

function isActionSheetSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = Capacitor.getPlatform();
    return p === "ios" || p === "android" || p === "web";
  } catch {
    return false;
  }
}

export type UseActionSheetReturn = {
  /** iOS / Android / Web (on web requires PWA Elements `pwa-action-sheet`) */
  supported: boolean;
  /** Whether `showActions` call is in progress */
  isPresenting: boolean;
  /** Opens native / web action sheet; returns selected index */
  showActions: (options: ShowActionsOptions) => Promise<ShowActionsResult>;
};

/**
 * Thin wrapper for `@capacitor/action-sheet`. Button styles (`ActionSheetButtonStyle`)
 * matter on iOS only; web needs PWA Elements installed.
 */
export function useActionSheet(): UseActionSheetReturn {
  const supported = useMemo(() => isActionSheetSupported(), []);
  const [isPresenting, setIsPresenting] = useState(false);

  const showActions = useCallback(async (options: ShowActionsOptions) => {
    if (!isActionSheetSupported()) {
      throw new Error("Action Sheet is not available in this environment.");
    }
    setIsPresenting(true);
    try {
      return await ActionSheet.showActions(options);
    } finally {
      setIsPresenting(false);
    }
  }, []);

  return { supported, isPresenting, showActions };
}
