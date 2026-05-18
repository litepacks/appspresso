import { describe, expect, it } from "vitest";
import {
  appspressoGradientBg,
  appspressoGradientBgClass,
  appspressoGradientMotion,
  appspressoGradientTextClass,
} from "./gradient";

describe("gradient utils", () => {
  it("preset keys return tailwind classes", () => {
    expect(appspressoGradientBg.brand).toContain("appspresso-gradient-brand");
    expect(appspressoGradientMotion.panWide).toMatch(
      /animate-appspresso-gradient-pan/,
    );
  });

  it("appspressoGradientBgClass animated ekler", () => {
    const still = appspressoGradientBgClass("brandSoft");
    const moving = appspressoGradientBgClass("brandSoft", { animated: true });
    expect(still).not.toMatch(/animate-appspresso-gradient-pan/);
    expect(moving).toMatch(/animate-appspresso-gradient-pan/);
  });

  it("appspressoGradientTextClass includes clip and gradient", () => {
    const c = appspressoGradientTextClass();
    expect(c).toMatch(/bg-clip-text/);
    expect(c).toMatch(/appspresso-gradient-text/);
  });
});
