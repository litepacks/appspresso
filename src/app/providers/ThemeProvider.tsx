import { useAtom } from "jotai";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { getInjectedAppMeta } from "@/build/injected-app-meta";
import type { ThemePreference } from "@/config/types";
import { setStatusBarTheme } from "@/services/appearance.service";
import { themePreferenceAtom } from "@/state/atoms";
import { applyAppspressoThemeForMode } from "@/theme/apply-palette";
import { resolveTheme } from "@/theme/apply-theme";

function readPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref] = useAtom(themePreferenceAtom);
  const [prefersDark, setPrefersDark] = useState(readPrefersDark);

  const resolved = useMemo(
    () => resolveTheme(pref, prefersDark),
    [pref, prefersDark],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => setPrefersDark(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
    void setStatusBarTheme(resolved);
    const app = getInjectedAppMeta();
    applyAppspressoThemeForMode(resolved, app?.theme?.palette);
  }, [resolved]);

  return <>{children}</>;
}

export type { ThemePreference };
