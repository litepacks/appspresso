import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAppInfoSnapshot } from "@/lib/app-info";

vi.mock("@/build/injected-app-meta", () => ({
  getInjectedAppMeta: vi.fn(),
}));

import { getInjectedAppMeta } from "@/build/injected-app-meta";

describe("getAppInfoSnapshot", () => {
  beforeEach(() => {
    vi.mocked(getInjectedAppMeta).mockReturnValue(null);
  });

  it("default fields when no meta", () => {
    const s = getAppInfoSnapshot();
    expect(s.meta).toBeNull();
    expect(s.displayName).toBe("App");
    expect(s.appId).toBe("");
    expect(s.version).toMatch(/\d/);
  });

  it("meta dolu", () => {
    vi.mocked(getInjectedAppMeta).mockReturnValue({
      displayName: "Deneme",
      id: "com.deneme.app",
      version: "2.0.0",
      description: "Description",
      icon: "/icon.svg",
    });
    const s = getAppInfoSnapshot("9.9.9");
    expect(s.version).toBe("9.9.9");
    expect(s.displayName).toBe("Deneme");
    expect(s.appId).toBe("com.deneme.app");
    expect(s.description).toBe("Description");
    expect(s.icon).toBe("/icon.svg");
  });
});
