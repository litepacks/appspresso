import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getAccessToken,
  setAccessToken,
} from "@/auth/session-store";

describe("syncHttpAccessToken", () => {
  afterEach(async () => {
    sessionStorage.clear();
    await clearSession();
    vi.clearAllMocks();
  });

  it("persists token via session-store", async () => {
    const { syncHttpAccessToken } = await import("./token-bridge");
    await syncHttpAccessToken("jwt-1");
    expect(getAccessToken()).toBe("jwt-1");
  });

  it("clears session when token is null", async () => {
    await setAccessToken("old");
    const { syncHttpAccessToken } = await import("./token-bridge");
    await syncHttpAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it("rethrows on storage failure", async () => {
    const { syncHttpAccessToken } = await import("./token-bridge");
    vi.spyOn(
      await import("@/auth/session-store"),
      "setAccessToken",
    ).mockRejectedValueOnce(new Error("storage down"));

    await expect(syncHttpAccessToken("x")).rejects.toThrow("storage down");
  });
});
