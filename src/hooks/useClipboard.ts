import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isClipboardApiAvailable,
  isClipboardReadSupported,
  isClipboardWriteSupported,
  readClipboardText,
  writeClipboardText,
} from "@/lib/clipboard";

export type UseClipboardOptions = {
  /**
   * After `copy`, `copied` resets to `false` after this ms.
   * Pass `0` to disable auto reset.
   */
  copiedResetMs?: number;
};

export type UseClipboardReturn = {
  /** En az okuma veya yazmadan biri var */
  supported: boolean;
  writeSupported: boolean;
  readSupported: boolean;
  /** Briefly true after successful copy (feedback) */
  copied: boolean;
  copy: (text: string) => Promise<void>;
  paste: () => Promise<string>;
  /** Clears `copied` flag manually */
  resetCopied: () => void;
};

/**
 * Clipboard read/write via Async Clipboard API. Requires secure context (HTTPS / localhost).
 */
export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardReturn {
  const copiedResetMs = options.copiedResetMs ?? 2000;

  const writeSupported = useMemo(() => isClipboardWriteSupported(), []);
  const readSupported = useMemo(() => isClipboardReadSupported(), []);
  const supported = useMemo(() => isClipboardApiAvailable(), []);

  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = undefined;
    }
  }, []);

  const resetCopied = useCallback(() => {
    clearResetTimer();
    setCopied(false);
  }, [clearResetTimer]);

  const copy = useCallback(
    async (text: string) => {
      await writeClipboardText(text);
      setCopied(true);
      clearResetTimer();
      if (copiedResetMs > 0) {
        resetTimerRef.current = setTimeout(() => {
          setCopied(false);
          resetTimerRef.current = undefined;
        }, copiedResetMs);
      }
    },
    [clearResetTimer, copiedResetMs],
  );

  const paste = useCallback(() => readClipboardText(), []);

  useEffect(() => {
    return () => clearResetTimer();
  }, [clearResetTimer]);

  return {
    supported,
    writeSupported,
    readSupported,
    copied,
    copy,
    paste,
    resetCopied,
  };
}

export {
  isClipboardApiAvailable,
  isClipboardReadSupported,
  isClipboardWriteSupported,
  readClipboardText,
  writeClipboardText,
} from "@/lib/clipboard";
