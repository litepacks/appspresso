import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInAppBrowser } from "./useInAppBrowser";

vi.mock("@/services/in-app-browser.service", () => ({
  isInAppBrowserAvailable: vi.fn().mockResolvedValue(true),
  openInAppBrowserExternal: vi.fn().mockResolvedValue(undefined),
  openInAppBrowserInternal: vi.fn().mockResolvedValue(undefined),
  closeInAppBrowser: vi.fn().mockResolvedValue(undefined),
}));

describe("useInAppBrowser", () => {
  it("available true olur", async () => {
    const { result } = renderHook(() => useInAppBrowser());
    await waitFor(() => {
      expect(result.current.available).toBe(true);
    });
    expect(typeof result.current.openExternal).toBe("function");
    expect(typeof result.current.openInternal).toBe("function");
  });
});
