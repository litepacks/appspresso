import { describe, expect, it } from "vitest";
import { sentryPlugin } from "./index.js";

describe("sentryPlugin", () => {
  it("exports a definePlugin factory", () => {
    const instance = sentryPlugin({ enabled: false });
    expect(instance.name).toBe("@appspresso/plugin-sentry");
  });
});
