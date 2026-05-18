export type DeepLinkPayload = {
  scheme: string;
  /** Normalized path without leading slash, e.g. "purchase" or "notifications/detail" */
  pathKey: string;
  params: Record<string, string>;
  rawUrl: string;
};

export type DeepLinkTarget = "purchase" | "referral" | "notificationsDetail";

export type DeepLinkResult =
  | { valid: true; resolvedRoute: string; target: DeepLinkTarget }
  | { valid: false; resolvedRoute?: string; reason: string };
