import { definePlugin } from "appspresso/plugin";
import { describe, expect, it } from "vitest";
import { createPluginTestRuntime } from "./index.js";

describe("createPluginTestRuntime", () => {
  it("runs setup → onBootstrap → onAppReady → dispose", async () => {
    const order: string[] = [];
    const plugin = definePlugin({
      name: "@test/lifecycle",
      setup() {
        order.push("setup");
      },
      async onBootstrap() {
        order.push("bootstrap");
      },
      async onAppReady() {
        order.push("ready");
      },
      async dispose() {
        order.push("dispose");
      },
    })();

    const rt = createPluginTestRuntime({ plugins: [plugin] });
    await rt.runLifecycle();
    await rt.dispose();

    expect(order).toEqual(["setup", "bootstrap", "ready", "dispose"]);
  });
});
