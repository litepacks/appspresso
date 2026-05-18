import { describe, expect, it } from "vitest";
import { FONT_CSS_VAR_NAMES } from "./fonts";

describe("fonts", () => {
  it("CSS variable names are stable", () => {
    expect(FONT_CSS_VAR_NAMES.sans).toBe("--font-sans");
    expect(FONT_CSS_VAR_NAMES.mono).toBe("--font-mono");
  });
});
