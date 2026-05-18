import { useContext, useEffect, useState } from "react";
import { FilesystemContext, type FilesystemCtx } from "./context";

export type UseFilesystemResult = FilesystemCtx & {
  /** Whether `@capacitor/filesystem` is loaded (web + native). */
  ready: boolean;
};

/**
 * Capacitor Filesystem — use under `FilesystemProvider`.
 * Default directory / `basePath` come from provider `config`.
 */
export function useFilesystem(): UseFilesystemResult {
  const ctx = useContext(FilesystemContext);
  if (!ctx) {
    throw new Error("useFilesystem must be used within FilesystemProvider");
  }

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void ctx.available.then((ok) => {
      if (!cancelled) setReady(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [ctx.available]);

  return { ...ctx, ready };
}
