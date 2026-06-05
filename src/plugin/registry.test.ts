import { describe, expect, it } from "vitest";
import { definePlugin } from "./define-plugin";
import {
  PluginConflictError,
  PluginDependencyCycleError,
  PluginMissingDependencyError,
} from "./errors";
import { createPluginRegistry } from "./registry";

const pluginA = definePlugin({
  name: "@test/a",
  setup() {},
})();

const pluginB = definePlugin({
  name: "@test/b",
  after: ["@test/a"],
  setup() {},
})();

describe("PluginRegistry", () => {
  it("orders plugins by after dependency", () => {
    const reg = createPluginRegistry([pluginB, pluginA]);
    expect(reg.summary.names).toEqual(["@test/a", "@test/b"]);
  });

  it("throws on missing capability", () => {
    const needsAuth = definePlugin({
      name: "@test/needs-auth",
      requires: ["auth"],
      setup() {},
    })();
    expect(() => createPluginRegistry([needsAuth], { omit: ["auth"] })).toThrow(
      PluginMissingDependencyError,
    );
  });

  it("throws on plugin conflict", () => {
    const x = definePlugin({
      name: "@test/x",
      conflicts: ["@test/y"],
      setup() {},
    })();
    const y = definePlugin({
      name: "@test/y",
      setup() {},
    })();
    expect(() => createPluginRegistry([x, y])).toThrow(PluginConflictError);
  });

  it("throws on after cycle", () => {
    const p1 = definePlugin({
      name: "@test/1",
      after: ["@test/2"],
      setup() {},
    })();
    const p2 = definePlugin({
      name: "@test/2",
      after: ["@test/1"],
      setup() {},
    })();
    expect(() => createPluginRegistry([p1, p2])).toThrow(
      PluginDependencyCycleError,
    );
  });
});
