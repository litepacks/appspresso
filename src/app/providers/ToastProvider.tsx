import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

function useDocumentDarkClass(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return dark;
}

/**
 * Below top `AppTopBar` (~`min-h-14` + `safe-top`); spacing aligned with notch.
 * Fine-tune: ~1rem lower than previous `4rem` (below title + breathing room).
 */
const TOAST_TOP_OFFSET = "calc(env(safe-area-inset-top, 0px) + 5rem)" as const;

/**
 * Hosts Sonner `<Toaster />` and follows `ThemeProvider` toggling of the `dark` class.
 * Use `toast` from `sonner` or `appspresso/lib/toast` anywhere under `StoreProvider`.
 * — Close button off; position below top title (offset).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const dark = useDocumentDarkClass();

  return (
    <>
      {children}
      <Toaster
        richColors
        closeButton={false}
        position="top-center"
        theme={dark ? "dark" : "light"}
        offset={{ top: TOAST_TOP_OFFSET }}
        mobileOffset={{ top: TOAST_TOP_OFFSET }}
        toastOptions={{ closeButton: false }}
      />
    </>
  );
}
