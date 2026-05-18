import { describe, expect, it } from "vitest";
import { normalizeInAppBrowserUrl } from "./in-app-browser.service";

describe("in-app-browser.service", () => {
  it("normalizeInAppBrowserUrl http(s) zorunlu", () => {
    expect(normalizeInAppBrowserUrl("https://example.com")).toBe(
      "https://example.com",
    );
    expect(normalizeInAppBrowserUrl("  http://a.test/path  ")).toBe(
      "http://a.test/path",
    );
    expect(() => normalizeInAppBrowserUrl("example.com")).toThrow(/http/i);
    expect(() => normalizeInAppBrowserUrl("")).toThrow();
  });
});
