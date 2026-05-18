import { describe, expect, it } from "vitest";
import { applyAppspressoThemeForMode } from "./apply-palette";

describe("applyAppspressoThemeForMode", () => {
  it("sets only provided keys on documentElement", () => {
    document.documentElement.style.setProperty("--primary", "0 0% 50%");

    applyAppspressoThemeForMode("light", {
      light: { primary: "221 83% 53%", primaryForeground: "0 0% 100%" },
    });

    expect(
      document.documentElement.style.getPropertyValue("--primary").trim(),
    ).toBe("221 83% 53%");
    expect(
      document.documentElement.style
        .getPropertyValue("--primary-foreground")
        .trim(),
    ).toBe("0 0% 100%");
    expect(
      document.documentElement.style.getPropertyValue("--ring").trim(),
    ).toBe("");

    applyAppspressoThemeForMode("light", null);
    expect(
      document.documentElement.style.getPropertyValue("--primary").trim(),
    ).toBe("");
  });

  it("uses dark slots in dark mode", () => {
    applyAppspressoThemeForMode("dark", {
      dark: { ring: "220 10% 80%" },
    });
    expect(
      document.documentElement.style.getPropertyValue("--ring").trim(),
    ).toBe("220 10% 80%");

    applyAppspressoThemeForMode("dark", null);
  });
});
