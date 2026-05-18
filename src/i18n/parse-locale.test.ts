import { describe, expect, it } from "vitest";
import { parseLocalePathFromViteGlobKey } from "@/i18n";

describe("parseLocalePathFromViteGlobKey", () => {
  it("parses standard locales path on posix and windows-ish keys", () => {
    expect(parseLocalePathFromViteGlobKey("./locales/demo/en.json")).toEqual({
      ns: "demo",
      lng: "en",
    });
    expect(
      parseLocalePathFromViteGlobKey("C:\\app\\locales\\ns\\de.json"),
    ).toEqual({ ns: "ns", lng: "de" });
  });

  it("returns null when pattern does not match", () => {
    expect(parseLocalePathFromViteGlobKey("./foo/en.json")).toBeNull();
  });
});
