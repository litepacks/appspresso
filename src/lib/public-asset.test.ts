import { describe, expect, it } from "vitest";
import { publicAssetUrl } from "./public-asset";

describe("publicAssetUrl", () => {
  it("joins BASE_URL and normalizes path", () => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
    expect(publicAssetUrl("icon.svg")).toBe(`${base}icon.svg`);
    expect(publicAssetUrl("/icon.svg")).toBe(`${base}icon.svg`);
    expect(publicAssetUrl("  public/splash.svg ")).toBe(`${base}splash.svg`);
  });
});
