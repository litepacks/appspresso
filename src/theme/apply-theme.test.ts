import { describe, expect, it } from "vitest";
import { resolveTheme } from "@/theme/apply-theme";

describe("resolveTheme", () => {
  it("respects explicit light", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
  });

  it("respects explicit dark", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
