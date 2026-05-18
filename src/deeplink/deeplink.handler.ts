import type { NavigateFunction } from "react-router-dom";
import { logger } from "@/lib/logger";
import { lastDeepLinkSnapshotAtom } from "@/state/atoms";
import { appStore } from "@/state/store";
import { parseDeepLink } from "./deeplink.parser";
import { resolveDeepLinkRoute } from "./deeplink.routes";

export function trackDeepLinkOpened(args: {
  rawUrl: string;
  path: string;
  params: Record<string, string>;
  resolvedRoute: string | undefined;
  valid: boolean;
}): void {
  if (!import.meta.env.DEV) return;
  logger.debug("trackDeepLinkOpened", { ...args });
}

export function handleDeepLink(url: string, navigate: NavigateFunction): void {
  const payload = parseDeepLink(url);
  if (!payload) {
    appStore.set(lastDeepLinkSnapshotAtom, {
      rawUrl: url,
      at: Date.now(),
      parseOk: false,
      route: "/",
    });
    trackDeepLinkOpened({
      rawUrl: url,
      path: "",
      params: {},
      resolvedRoute: undefined,
      valid: false,
    });
    navigate("/", { replace: true });
    return;
  }
  const result = resolveDeepLinkRoute(payload);
  const route = result.valid ? result.resolvedRoute : "/";
  appStore.set(lastDeepLinkSnapshotAtom, {
    rawUrl: url,
    at: Date.now(),
    parseOk: true,
    route,
  });
  trackDeepLinkOpened({
    rawUrl: url,
    path: payload.pathKey,
    params: payload.params,
    resolvedRoute: result.valid ? result.resolvedRoute : undefined,
    valid: result.valid,
  });
  if (result.valid) {
    navigate(result.resolvedRoute);
  } else {
    navigate("/", { replace: true });
  }
}
