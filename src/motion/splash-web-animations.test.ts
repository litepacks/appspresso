import { describe, expect, it } from "vitest";
import {
  parseSplashWebAnimation,
  splashWebAnimationLoops,
} from "@/motion/splash-web-animations";

describe("splashWebAnimationLoops", () => {
  it("every loop key carries animate + transition", () => {
    for (const key of Object.keys(splashWebAnimationLoops)) {
      const c =
        splashWebAnimationLoops[key as keyof typeof splashWebAnimationLoops];
      expect(c.animate).toBeDefined();
      expect(c.transition).toBeDefined();
    }
  });

  it("parseSplashWebAnimation bilinmeyeni none yapar", () => {
    expect(parseSplashWebAnimation("breathe")).toBe("breathe");
    expect(parseSplashWebAnimation("nope")).toBe("none");
  });
});
