import { describe, expect, it } from "vitest";
import { routeTree } from "@/app/route-tree";

describe("routeTree", () => {
  it("declares main tab routes and detail route", () => {
    expect(routeTree).toHaveLength(7);
    const paths = routeTree.map((r) => r.path);
    expect(paths).toEqual([
      "",
      "settings",
      "database",
      "purchase",
      "referral",
      "notifications",
      "notifications/detail",
    ]);
    expect(routeTree[0].handle.tabId).toBe("home");
    const detail = routeTree.find((r) => r.path === "notifications/detail");
    expect(detail?.handle.showTabBar).toBe(false);
  });

  it("lazy-loads every page module", async () => {
    const modules = await Promise.all(routeTree.map((e) => e.load()));
    expect(modules.every((m) => typeof m.default === "function")).toBe(true);
  });
});
