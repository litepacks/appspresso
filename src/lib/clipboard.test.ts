import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isClipboardApiAvailable,
  isClipboardReadSupported,
  isClipboardWriteSupported,
  readClipboardText,
  writeClipboardText,
} from "@/lib/clipboard";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clipboard lib", () => {
  const writeText = vi.fn(() => Promise.resolve());
  const readText = vi.fn(() => Promise.resolve("pasted"));

  it("yazma ve okuma", async () => {
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        clipboard: { writeText, readText },
      }),
    );
    expect(isClipboardWriteSupported()).toBe(true);
    expect(isClipboardReadSupported()).toBe(true);
    expect(isClipboardApiAvailable()).toBe(true);

    await writeClipboardText("x");
    expect(writeText).toHaveBeenCalledWith("x");

    await expect(readClipboardText()).resolves.toBe("pasted");
  });

  it("false and error when clipboard missing", async () => {
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      clipboard: undefined,
    } as Navigator);
    expect(isClipboardWriteSupported()).toBe(false);
    await expect(writeClipboardText("a")).rejects.toThrow(/not supported/);
  });
});
