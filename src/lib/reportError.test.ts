import { describe, expect, it, vi } from "vitest";
import { reportError } from "@/lib/reportError";
import * as telemetry from "@/services/telemetry.service";

describe("reportError", () => {
  it("forwards to captureException with source tag", () => {
    const spy = vi
      .spyOn(telemetry, "captureException")
      .mockImplementation(() => {});
    const err = new Error("bad");
    reportError(err, { feature: "checkout" });
    expect(spy).toHaveBeenCalledWith(err, {
      source: "reportError",
      feature: "checkout",
    });
    spy.mockRestore();
  });
});
