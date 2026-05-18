import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNativeShare } from "@/hooks/useNativeShare";
import { isNavigatorShareSupported } from "@/services/native-share.service";

vi.mock("@/services/native-share.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/services/native-share.service")>();
  return {
    ...actual,
    isNativeShareAvailable: vi.fn().mockResolvedValue(true),
    nativeShare: vi.fn().mockResolvedValue(undefined),
  };
});

import { nativeShare } from "@/services/native-share.service";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isNavigatorShareSupported", () => {
  it("false when navigator.share missing", () => {
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      share: undefined,
    } as unknown as Navigator);
    expect(isNavigatorShareSupported()).toBe(false);
  });
});

describe("useNativeShare", () => {
  const shareMock = vi.fn(() => Promise.resolve());
  const canShareMock = vi.fn((_data: ShareData) => true);

  beforeEach(() => {
    shareMock.mockClear();
    canShareMock.mockReturnValue(true);
    vi.stubGlobal(
      "navigator",
      Object.assign(globalThis.navigator, {
        share: shareMock,
        canShare: canShareMock,
      }),
    );
  });

  it("supported and share call", async () => {
    const { result } = renderHook(() => useNativeShare());
    await waitFor(() => {
      expect(result.current.supported).toBe(true);
    });
    await act(async () => {
      await result.current.share({
        title: "Title",
        text: "Metin",
        url: "https://example.com",
      });
    });
    expect(nativeShare).toHaveBeenCalledWith({
      title: "Title",
      text: "Metin",
      url: "https://example.com",
    });
    expect(result.current.isSharing).toBe(false);
  });

  it("throws when share unsupported", async () => {
    const { isNativeShareAvailable } = await import(
      "@/services/native-share.service"
    );
    vi.mocked(isNativeShareAvailable).mockResolvedValueOnce(false);
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      share: undefined,
    } as unknown as Navigator);
    const { result } = renderHook(() => useNativeShare());
    await waitFor(() => {
      expect(result.current.supported).toBe(false);
    });
    await expect(act(() => result.current.share({ url: "x" }))).rejects.toThrow(
      /not supported/,
    );
  });

  it("throws with files when canShare false", async () => {
    canShareMock.mockReturnValue(false);
    const file = new File(["x"], "a.txt", { type: "text/plain" });
    const { result } = renderHook(() => useNativeShare());
    await waitFor(() => {
      expect(result.current.supported).toBe(true);
    });
    expect(result.current.canShare({ files: [file] })).toBe(false);
    await expect(
      act(() => result.current.share({ files: [file] })),
    ).rejects.toThrow(/cannot be shared/);
  });
});
