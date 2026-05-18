import type { ReactNode } from "react";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { FilesystemProvider } from "@/app/providers/FilesystemProvider";
import { I18nProvider } from "@/app/providers/I18nProvider";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { RevenueCatProvider } from "@/app/providers/RevenueCatProvider";
import { StoreProvider } from "@/app/providers/StoreProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import type { AuthAdapter } from "@/auth/adapter";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { FilesystemProviderConfig } from "@/filesystem/types";

/** Provider nesting: Query (outer) → … → Filesystem → Auth → RevenueCat → I18n (inner). */
export type AppspressoProviderLayer =
  | "query"
  | "store"
  | "notification"
  | "theme"
  | "toast"
  | "tooltip"
  | "filesystem"
  | "auth"
  | "revenueCat"
  | "i18n";

export type AppspressoRootProvidersProps = {
  children: ReactNode;
  /** Layers to skip so hosts can trim the tree. */
  omit?: AppspressoProviderLayer[];
  /** In production, pass Firebase / Supabase / custom adapter here. */
  authAdapter?: AuthAdapter;
  /** Capacitor Filesystem default directory / basePath. */
  filesystemConfig?: FilesystemProviderConfig;
};

/**
 * Default provider stack for the template shell. Demo and full `App` use this component;
 * use `omit` to drop layers.
 */
export function AppspressoRootProviders({
  children,
  omit = [],
  authAdapter,
  filesystemConfig,
}: AppspressoRootProvidersProps) {
  const skip = new Set(omit);
  let node: ReactNode = children;

  if (!skip.has("i18n")) {
    node = <I18nProvider>{node}</I18nProvider>;
  }
  if (!skip.has("revenueCat")) {
    node = <RevenueCatProvider>{node}</RevenueCatProvider>;
  }
  if (!skip.has("filesystem")) {
    node = (
      <FilesystemProvider config={filesystemConfig}>{node}</FilesystemProvider>
    );
  }
  if (!skip.has("auth")) {
    node = <AuthProvider adapter={authAdapter}>{node}</AuthProvider>;
  }
  if (!skip.has("toast")) {
    node = <ToastProvider>{node}</ToastProvider>;
  }
  if (!skip.has("tooltip")) {
    node = (
      <TooltipProvider delayDuration={300} skipDelayDuration={0}>
        {node}
      </TooltipProvider>
    );
  }
  if (!skip.has("theme")) {
    node = <ThemeProvider>{node}</ThemeProvider>;
  }
  if (!skip.has("notification")) {
    node = <NotificationProvider>{node}</NotificationProvider>;
  }
  if (!skip.has("store")) {
    node = <StoreProvider>{node}</StoreProvider>;
  }
  if (!skip.has("query")) {
    node = <QueryProvider>{node}</QueryProvider>;
  }

  return node;
}
