import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

export function GlobalErrorListeners() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      reportError(ev.error ?? ev.message, { kind: "window.error" });
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      reportError(ev.reason, { kind: "unhandledrejection" });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
