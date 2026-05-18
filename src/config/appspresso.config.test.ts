import { describe, expect, it } from "vitest";
import { getAppspressoConfig } from "@/config/appspresso.config";

describe("getAppspressoConfig", () => {
  it("returns package defaults and env slice", () => {
    const c = getAppspressoConfig();
    expect(c.package.deeplink.scheme).toBe("myapp");
    expect(c.package.mount.rootElementId).toBe("root");
    expect(c.env).toBeDefined();
  });
});
