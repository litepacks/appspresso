import { describe, expect, it } from "vitest";
import {
  parseFeatureFlagsFromResponseBody,
  parseFeatureFlagsJson,
  resolveFeatureFlag,
} from "@/config/feature-flags";

describe("feature flags", () => {
  it("parseFeatureFlagsJson valid object", () => {
    expect(parseFeatureFlagsJson('{"a":true,"b":false}')).toEqual({
      a: true,
      b: false,
    });
  });

  it("parseFeatureFlagsJson undefined when invalid", () => {
    expect(parseFeatureFlagsJson("not json")).toBeUndefined();
    expect(parseFeatureFlagsJson('["x"]')).toBeUndefined();
    expect(parseFeatureFlagsJson('{"n":1}')).toBeUndefined();
  });

  it("parseFeatureFlagsFromResponseBody", () => {
    expect(parseFeatureFlagsFromResponseBody({ x: true })).toEqual({ x: true });
    expect(parseFeatureFlagsFromResponseBody(null)).toBeUndefined();
  });

  it("resolveFeatureFlag", () => {
    expect(resolveFeatureFlag({ a: false }, "a", true)).toBe(false);
    expect(resolveFeatureFlag({}, "missing", true)).toBe(true);
  });
});
