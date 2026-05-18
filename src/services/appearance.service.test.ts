import { beforeEach, describe, expect, it } from "vitest";
import {
  applySafeAreaClass,
  hideSplashScreen,
  initAppearance,
} from "@/services/appearance.service";

describe("appearance.service (web)", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("cap-safe");
  });

  it("applySafeAreaClass adds cap-safe to html element", () => {
    applySafeAreaClass();
    expect(document.documentElement.classList.contains("cap-safe")).toBe(true);
  });

  it("initAppearance applies safe area class", async () => {
    await initAppearance("dark");
    expect(document.documentElement.classList.contains("cap-safe")).toBe(true);
  });

  it("hideSplashScreen resolves on web", async () => {
    await expect(hideSplashScreen()).resolves.toBeUndefined();
  });
});
