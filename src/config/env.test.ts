import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";
import { getEnvConfig } from "./env";

describe("getEnvConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("trims string env vars and parses debug flag", () => {
    vi.stubEnv("VITE_API_BASE_URL", "  https://api.example  ");
    vi.stubEnv("VITE_SENTRY_DSN", "");
    vi.stubEnv("VITE_ENABLE_DEBUG_PANEL", "true");
    vi.stubEnv("VITE_GIT_SHA", " abc123 ");

    const c = getEnvConfig();
    expect(c.apiBaseUrl).toBe("https://api.example");
    expect(c.sentryDsn).toBeUndefined();
    expect(c.enableDebugPanel).toBe(true);
    expect(c.gitSha).toBe("abc123");
    expect(c.revenuecatApiKeyIos).toBeUndefined();
    expect(c.revenuecatApiKeyAndroid).toBeUndefined();
  });

  it("parses VITE_FEATURE_FLAGS JSON", () => {
    vi.stubEnv("VITE_FEATURE_FLAGS", '{"beta":true,"off":false}');
    const c = getEnvConfig();
    expect(c.featureFlags).toEqual({ beta: true, off: false });
  });

  it("ignores invalid VITE_FEATURE_FLAGS", () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    vi.stubEnv("VITE_FEATURE_FLAGS", "not-json");
    const c = getEnvConfig();
    expect(c.featureFlags).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("treats whitespace-only as unset", () => {
    vi.stubEnv("VITE_API_BASE_URL", "   ");
    vi.stubEnv("VITE_GIT_SHA", "");
    const c = getEnvConfig();
    expect(c.apiBaseUrl).toBeUndefined();
    expect(c.gitSha).toBeUndefined();
  });
});
