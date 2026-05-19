import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getEffectiveApiBaseUrl,
  getFeatureFlags,
  getRuntimeConfig,
  isFeatureEnabled,
  loadRuntimeConfig,
} from "@/config/runtime";
import { logger } from "@/lib/logger";

describe("runtime config", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loadRuntimeConfig sets featureFlags on cache", async () => {
    await loadRuntimeConfig();
    expect(getRuntimeConfig()).toEqual({ featureFlags: {} });
  });

  it("getEffectiveApiBaseUrl falls back to empty string without env override", async () => {
    await loadRuntimeConfig();
    const url = getEffectiveApiBaseUrl();
    expect(typeof url).toBe("string");
  });

  it("merges remote feature flags when URL responds ok", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS_URL", "https://flags.example/flags.json");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ beta: true }),
      }),
    );
    await loadRuntimeConfig();
    expect(getFeatureFlags()).toEqual({ beta: true });
    expect(isFeatureEnabled("beta")).toBe(true);
    expect(isFeatureEnabled("missing", true)).toBe(true);
    expect(isFeatureEnabled("missing", false)).toBe(false);
  });

  it("warns when remote feature flags body is invalid", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS_URL", "https://flags.example/bad.json");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ not: "a-flag-map" }),
      }),
    );
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    await loadRuntimeConfig();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("remote feature flags"),
    );
  });

  it("warns when feature flags URL returns non-ok status", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS_URL", "https://flags.example/err.json");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    await loadRuntimeConfig();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("feature flags URL response failed"),
      expect.objectContaining({ status: 503 }),
    );
  });

  it("warns when feature flags fetch throws", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS_URL", "https://flags.example/down.json");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    await loadRuntimeConfig();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("could not load feature flags remotely"),
      expect.any(Object),
    );
  });
});
