import { describe, expect, it } from "vitest";
import { appspressoPackageConfig } from "@/config/appspresso.config";
import { assertValidEnvConfig, assertValidPackageConfig } from "./validate";

describe("validate", () => {
  it("accepts packaged default config", () => {
    expect(() =>
      assertValidPackageConfig(appspressoPackageConfig),
    ).not.toThrow();
  });

  it("rejects broken package config", () => {
    expect(() => assertValidPackageConfig({})).toThrow(
      /invalid appspresso package config/,
    );
  });

  it("accepts empty env config", () => {
    expect(() => assertValidEnvConfig({})).not.toThrow();
  });

  it("rejects invalid env sentry URL", () => {
    expect(() =>
      assertValidEnvConfig({ sentryDsn: "not-a-valid-url" }),
    ).toThrow(/invalid environment configuration/);
  });
});
