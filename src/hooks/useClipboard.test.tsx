import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "@/hooks/useClipboard";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useClipboard", () => {
  it("copy writes text and sets copied flag", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        clipboard: { writeText, readText: vi.fn() },
      }),
    );

    const { result } = renderHook(() => useClipboard({ copiedResetMs: 1000 }));

    await act(async () => {
      await result.current.copy("merhaba");
    });
    expect(writeText).toHaveBeenCalledWith("merhaba");
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });

  it("paste returns readText", async () => {
    const readText = vi.fn(() => Promise.resolve("content"));
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        clipboard: { writeText: vi.fn(), readText },
      }),
    );
    const { result } = renderHook(() => useClipboard());
    let text = "";
    await act(async () => {
      text = await result.current.paste();
    });
    expect(text).toBe("content");
  });
});
