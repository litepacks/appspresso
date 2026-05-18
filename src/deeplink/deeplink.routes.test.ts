import { describe, expect, it } from "vitest";
import { resolveDeepLinkRoute } from "@/deeplink/deeplink.routes";
import type { DeepLinkPayload } from "@/deeplink/deeplink.types";

const basePayload = (over: Partial<DeepLinkPayload>): DeepLinkPayload => ({
  scheme: "myapp",
  pathKey: "referral",
  params: {},
  rawUrl: "x",
  ...over,
});

describe("resolveDeepLinkRoute", () => {
  it("maps referral with query string", () => {
    const r = resolveDeepLinkRoute(
      basePayload({ pathKey: "referral", params: { code: "z" } }),
    );
    expect(r).toEqual({
      valid: true,
      target: "referral",
      resolvedRoute: "/referral?code=z",
    });
  });

  it("maps nested notifications path", () => {
    const r = resolveDeepLinkRoute(
      basePayload({ pathKey: "notifications/detail", params: {} }),
    );
    expect(r.valid).toBe(true);
    expect(r).toMatchObject({
      target: "notificationsDetail",
      resolvedRoute: "/notifications/detail",
    });
  });

  it("marks unknown path", () => {
    const r = resolveDeepLinkRoute(basePayload({ pathKey: "nope" }));
    expect(r).toEqual({ valid: false, reason: "unknown-path" });
  });
});
