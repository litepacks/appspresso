import { describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";
import {
  captureException,
  captureMessage,
  initTelemetry,
} from "@/services/telemetry.service";

describe("telemetry.service", () => {
  it("captureException logs serialized error", () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    captureException(new Error("e"), { k: 1 });
    expect(spy).toHaveBeenCalledWith(
      "captureException",
      expect.objectContaining({
        k: 1,
        error: expect.stringContaining("Error: e"),
      }),
    );
    spy.mockRestore();
  });

  it("captureMessage logs via logger.info", () => {
    const spy = vi.spyOn(logger, "info").mockImplementation(() => {});
    captureMessage("info", "hello", { x: true });
    expect(spy).toHaveBeenCalledWith("telemetry: hello", { x: true });
    spy.mockRestore();
  });

  it("initTelemetry does not throw", () => {
    expect(() => initTelemetry()).not.toThrow();
  });
});
