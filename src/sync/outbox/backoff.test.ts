import { describe, expect, it } from "vitest";
import {
  computeBackoffMs,
  shouldMarkDead,
} from "./backoff";

describe("outbox backoff", () => {
  it("caps exponential backoff at 5 minutes", () => {
    expect(computeBackoffMs(0)).toBe(1000);
    expect(computeBackoffMs(10)).toBe(5 * 60 * 1000);
  });

  it("marks dead when non-retryable or max attempts", () => {
    expect(shouldMarkDead(1, false)).toBe(true);
    expect(shouldMarkDead(8, true)).toBe(true);
    expect(shouldMarkDead(3, true)).toBe(false);
  });
});
