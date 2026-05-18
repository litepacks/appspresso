import axios, { type InternalAxiosRequestConfig } from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const getEffectiveApiBaseUrl = vi.hoisted(() =>
  vi.fn(() => "https://api.test"),
);
const getAccessToken = vi.hoisted(() => vi.fn((): string | null => null));
const captureException = vi.hoisted(() => vi.fn());

vi.mock("@/config/runtime", () => ({
  getEffectiveApiBaseUrl,
}));

vi.mock("@/auth/session-store", () => ({
  getAccessToken,
}));

vi.mock("@/services/telemetry.service", () => ({
  captureException,
}));

import { http } from "@/api/http";
import { logger } from "@/lib/logger";

describe("http client", () => {
  beforeEach(() => {
    getEffectiveApiBaseUrl.mockReturnValue("https://api.test");
    getAccessToken.mockReturnValue(null);
    captureException.mockReset();
    vi.spyOn(logger, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("uses shared timeout from package constants", async () => {
    const { HTTP_TIMEOUT_MS } = await import("@/config/constants");
    expect(http.defaults.timeout).toBe(HTTP_TIMEOUT_MS);
  });

  it("request interceptor sets baseURL and bearer token", async () => {
    getAccessToken.mockReturnValue("secret-token");
    let captured: InternalAxiosRequestConfig | undefined;
    http.defaults.adapter = vi.fn(async (config) => {
      captured = config;
      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config: config as InternalAxiosRequestConfig,
      };
    });

    await http.get("/hello");

    expect(captured?.baseURL).toBe("https://api.test");
    expect(captured?.headers?.Authorization).toBe("Bearer secret-token");
  });

  it("response error interceptor logs and captures", async () => {
    const err = new axios.AxiosError(
      "boom",
      "ERR_NETWORK",
      undefined,
      undefined,
      undefined,
    );
    http.defaults.adapter = vi.fn(async () => {
      throw err;
    });

    await expect(http.get("/fail")).rejects.toThrow(/boom/);
    expect(logger.error).toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledWith(
      err,
      expect.objectContaining({ kind: "axios" }),
    );
  });
});
