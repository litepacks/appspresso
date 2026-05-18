import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("error and warn forward to console with context", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.error("x", { a: 1 });
    logger.warn("y");
    expect(err).toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("[warn] y");
  });
});
