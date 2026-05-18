import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrientationSnapshot } from "./orientation";

describe("getOrientationSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
  });

  it("returns portrait when matchMedia portrait", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("portrait"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const s = getOrientationSnapshot(1);
    expect(s.kind).toBe("portrait");
    expect(s.isPortrait).toBe(true);
    expect(s.isLandscape).toBe(false);
  });

  it("returns landscape when matchMedia landscape", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: !query.includes("portrait"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const s = getOrientationSnapshot(1);
    expect(s.kind).toBe("landscape");
  });

  it("portrait by ratio threshold without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 900,
    });
    const s = getOrientationSnapshot(1);
    expect(s.kind).toBe("portrait");
  });

  it("landscape by ratio threshold without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 400,
    });
    const s = getOrientationSnapshot(1);
    expect(s.kind).toBe("landscape");
  });
});
