import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY_PREFIX } from "@/config/constants";
import {
  secureStorageGet,
  secureStorageRemove,
  secureStorageSet,
} from "@/services/secure-storage.service";

describe("secure-storage (web / session fallback)", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("round-trips string values with prefixed keys", async () => {
    await secureStorageSet("demo_key", "secret");
    expect(sessionStorage.getItem(`${STORAGE_KEY_PREFIX}demo_key`)).toBe(
      "secret",
    );
    expect(await secureStorageGet("demo_key")).toBe("secret");
    await secureStorageRemove("demo_key");
    expect(await secureStorageGet("demo_key")).toBeNull();
  });
});
