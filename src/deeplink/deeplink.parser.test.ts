import { describe, expect, it } from "vitest";
import { parseDeepLink } from "@/deeplink/deeplink.parser";

describe("parseDeepLink", () => {
  it("parses host-style path", () => {
    const r = parseDeepLink("myapp://referral?code=abc");
    expect(r?.pathKey).toBe("referral");
    expect(r?.params.code).toBe("abc");
  });

  it("parses host + nested path as pathKey", () => {
    const r = parseDeepLink("myapp://notifications/detail?id=7");
    expect(r?.pathKey).toBe("notifications/detail");
    expect(r?.params.id).toBe("7");
  });

  it("rejects wrong scheme", () => {
    expect(parseDeepLink("https://example.com")).toBeNull();
  });

  it("returns null for malformed URL", () => {
    expect(parseDeepLink("not-a-url-at-all")).toBeNull();
  });
});
