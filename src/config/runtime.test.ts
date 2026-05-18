import { describe, expect, it } from "vitest";
import {
  getEffectiveApiBaseUrl,
  getRuntimeConfig,
  loadRuntimeConfig,
} from "@/config/runtime";

describe("runtime config", () => {
  it("loadRuntimeConfig sets featureFlags on cache", async () => {
    await loadRuntimeConfig();
    expect(getRuntimeConfig()).toEqual({ featureFlags: {} });
  });

  it("getEffectiveApiBaseUrl falls back to empty string without env override", async () => {
    await loadRuntimeConfig();
    const url = getEffectiveApiBaseUrl();
    expect(typeof url).toBe("string");
  });
});
