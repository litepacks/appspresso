import { describe, expect, it } from "vitest";
import {
  DEEPLINK_SCHEME,
  JOTAI_STORAGE,
  QUERY_PERSIST_KEY,
  STORAGE_KEY_PREFIX,
} from "./constants";

describe("constants", () => {
  it("exposes stable prefixes derived from package config", () => {
    expect(STORAGE_KEY_PREFIX).toBe("appkit_");
    expect(DEEPLINK_SCHEME).toBe("myapp");
    expect(JOTAI_STORAGE.theme).toBe(`${STORAGE_KEY_PREFIX}app_theme`);
    expect(QUERY_PERSIST_KEY).toContain(STORAGE_KEY_PREFIX);
  });
});
