import { describe, expect, it } from "vitest";
import { defineAppspressoRoutes } from "@/studio/routes/define";
import { validateAppspressoRoutes } from "@/studio/routes/validate";

describe("validateAppspressoRoutes", () => {
  it("accepts minimal tab config", () => {
    const routes = defineAppspressoRoutes({
      tabs: [
        {
          path: "",
          titleKey: "home.title",
          screen: "./pages/HomePage",
        },
      ],
    });
    const r = validateAppspressoRoutes(routes);
    expect(r.ok).toBe(true);
  });

  it("rejects duplicate tab paths", () => {
    const r = validateAppspressoRoutes({
      tabs: [
        { path: "a", titleKey: "a", screen: "./pages/A" },
        { path: "a", titleKey: "b", screen: "./pages/B" },
      ],
    });
    expect(r.ok).toBe(false);
  });
});
