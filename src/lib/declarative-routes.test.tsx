import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import {
  declarativeElementLeavesToRouteObjects,
  declarativeLazyLeavesToRouteObjects,
} from "@/lib/declarative-routes";

function Fake(): null {
  return null;
}

describe("declarative-routes", () => {
  it("declarativeElementLeavesToRouteObjects maps path and index leaves", () => {
    const routes = declarativeElementLeavesToRouteObjects([
      { index: true, element: <span>a</span> },
      { path: "x", element: <span>b</span> },
    ]);
    expect(routes[0]).toMatchObject({ index: true });
    expect(routes[1]).toMatchObject({ path: "x" });
  });

  it("declarativeLazyLeavesToRouteObjects wires lazy imports", async () => {
    const mod = async () => ({ default: Fake as ComponentType });
    const routes = declarativeLazyLeavesToRouteObjects([
      { index: true, lazy: mod },
      { path: "p", lazy: mod },
    ]);
    const first = routes[0];
    expect(first.index).toBe(true);
    expect(first.lazy).toBeDefined();
    const lazyFn = first.lazy as () => Promise<{ Component: ComponentType }>;
    const loaded = await lazyFn();
    expect(loaded?.Component).toBe(Fake);
    expect(routes[1].path).toBe("p");
  });
});
