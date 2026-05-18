import { describe, expect, it, vi } from "vitest";
import {
  canNativeShareSync,
  isNavigatorShareSupported,
} from "./native-share.service";

describe("native-share.service", () => {
  it("isNavigatorShareSupported", () => {
    expect(typeof isNavigatorShareSupported()).toBe("boolean");
  });

  it("canNativeShareSync uses canShare for files", () => {
    const canShare = vi.fn(() => true);
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        share: vi.fn(),
        canShare,
      }),
    );
    const file = new File(["a"], "a.txt", { type: "text/plain" });
    expect(canNativeShareSync({ files: [file] }, true)).toBe(true);
    expect(canShare).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("canNativeShareSync false when supported false", () => {
    expect(canNativeShareSync({ url: "https://x.test" }, false)).toBe(false);
  });
});
