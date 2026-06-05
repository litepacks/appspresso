import { describe, expect, it } from "vitest";
import {
  delay,
  getSplashBootstrapTiming,
  isSplashBackgroundDark,
  SPLASH_NATIVE_FALLBACK_HIDE_MS,
} from "./splash-bootstrap";

describe("splash-bootstrap", () => {
  it("returns default durations", () => {
    const t = getSplashBootstrapTiming();
    expect(t.minDisplayMs).toBeGreaterThanOrEqual(800);
    expect(t.exitDurationMs).toBeGreaterThanOrEqual(400);
    expect(t.nativeFadeOutMs).toBeGreaterThanOrEqual(400);
    expect(t.backgroundColor).toMatch(/^#/);
  });

  it("isSplashBackgroundDark detects dark background", () => {
    expect(isSplashBackgroundDark("#0f172a")).toBe(true);
    expect(isSplashBackgroundDark("#ffffff")).toBe(false);
  });

  it("uses 4s native splash fallback hide", () => {
    expect(SPLASH_NATIVE_FALLBACK_HIDE_MS).toBe(4_000);
  });

  it("delay bekler", async () => {
    const start = performance.now();
    await delay(40);
    expect(performance.now() - start).toBeGreaterThanOrEqual(35);
  });
});
