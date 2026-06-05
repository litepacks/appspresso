import { describe, expect, it } from "vitest";
import { defineModule } from "./define-module";
import { createModuleRegistry } from "./registry";
import { collectModuleAppRoutes } from "./merge-app-routes";
import { routeTree } from "@/app/route-tree";

describe("ModuleRegistry", () => {
  it("merges app routes by path", () => {
    const mod = defineModule({
      name: "settings",
      appRoutes: () => [
        {
          path: "settings",
          handle: {
            titleKey: "nav.settings",
            tabId: "settings",
            showTabBar: true,
            layout: "main",
          },
          load: () => import("@/pages/Settings"),
        },
      ],
    })();

    const registry = createModuleRegistry([mod]);
    const merged = collectModuleAppRoutes(registry, routeTree);
    const settings = merged.find((r) => r.path === "settings");
    expect(settings).toBeDefined();
  });

  it("detects module conflicts", () => {
    const a = defineModule({ name: "a", conflicts: ["b"] })();
    const b = defineModule({ name: "b" })();
    expect(() => createModuleRegistry([a, b])).toThrow(/conflict/i);
  });
});
