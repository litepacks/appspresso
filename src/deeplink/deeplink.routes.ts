import type {
  DeepLinkPayload,
  DeepLinkResult,
  DeepLinkTarget,
} from "./deeplink.types";

export const DEEPLINK_ROUTE_MAP: Record<string, DeepLinkTarget> = {
  purchase: "purchase",
  referral: "referral",
  "notifications/detail": "notificationsDetail",
};

const targetToPath: Record<DeepLinkTarget, string> = {
  purchase: "/purchase",
  referral: "/referral",
  notificationsDetail: "/notifications/detail",
};

export function resolveDeepLinkRoute(payload: DeepLinkPayload): DeepLinkResult {
  const target = DEEPLINK_ROUTE_MAP[payload.pathKey];
  if (!target) {
    return { valid: false, reason: "unknown-path" };
  }
  const base = targetToPath[target];
  const qs = new URLSearchParams(payload.params).toString();
  const resolvedRoute = qs ? `${base}?${qs}` : base;
  return { valid: true, target, resolvedRoute };
}
