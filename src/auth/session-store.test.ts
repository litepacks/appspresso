import { afterEach, describe, expect, it } from "vitest";
import {
  clearSession,
  getAccessToken,
  hydrateTokensFromStorage,
  setAccessToken,
} from "@/auth/session-store";
import { SECURE_STORAGE_KEYS, STORAGE_KEY_PREFIX } from "@/config/constants";

function prefixedStorageKey(logicalKey: string) {
  return `${STORAGE_KEY_PREFIX}${logicalKey}`;
}

describe("session-store", () => {
  afterEach(async () => {
    sessionStorage.clear();
    await clearSession();
  });

  it("hydrateTokensFromStorage reads access token from secure storage", async () => {
    sessionStorage.setItem(
      prefixedStorageKey(SECURE_STORAGE_KEYS.accessToken),
      "tok",
    );
    await hydrateTokensFromStorage();
    expect(getAccessToken()).toBe("tok");
  });

  it("setAccessToken persists token", async () => {
    await setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
  });

  it("clearSession drops memory token and keys", async () => {
    await setAccessToken("keep");
    await clearSession();
    expect(getAccessToken()).toBeNull();
    expect(
      sessionStorage.getItem(
        prefixedStorageKey(SECURE_STORAGE_KEYS.accessToken),
      ),
    ).toBeNull();
  });
});
