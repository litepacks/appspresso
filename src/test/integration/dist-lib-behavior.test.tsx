import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

async function resetRuntimeFlags() {
  const { loadRuntimeConfig } = await import("appspresso/config");
  await loadRuntimeConfig();
}

describe("dist-lib behavior (coverage)", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await resetRuntimeFlags();
  });

  it("loadRuntimeConfig VITE_FEATURE_FLAGS uygular", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS", '{"beta":true}');
    const { loadRuntimeConfig, getFeatureFlags, isFeatureEnabled } =
      await import("appspresso/config");
    await loadRuntimeConfig();
    expect(getFeatureFlags().beta).toBe(true);
    expect(isFeatureEnabled("beta", false)).toBe(true);
    expect(isFeatureEnabled("yok", true)).toBe(true);
  });

  it("remote flags override .env", async () => {
    vi.stubEnv("VITE_FEATURE_FLAGS", '{"a":false,"b":true}');
    vi.stubEnv("VITE_FEATURE_FLAGS_URL", "https://flags.test/app.json");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ a: true, c: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { loadRuntimeConfig, getFeatureFlags } = await import(
      "appspresso/config"
    );
    await loadRuntimeConfig();

    expect(getFeatureFlags()).toMatchObject({
      a: true,
      b: true,
      c: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://flags.test/app.json",
      expect.objectContaining({ credentials: "omit", cache: "no-store" }),
    );
  });

  it("createAppEventBus emit / on / clear", async () => {
    const { createAppEventBus } = await import("appspresso/lib/app-events");
    const bus = createAppEventBus<{ k: undefined; m: { n: number } }>();
    const onK = vi.fn();
    const onM = vi.fn();
    bus.on("k", onK);
    bus.on("m", onM);
    bus.emit("k");
    bus.emit("m", { n: 7 });
    expect(onK).toHaveBeenCalledTimes(1);
    expect(onM).toHaveBeenCalledWith({ n: 7 });

    bus.clear();
    bus.emit("k");
    expect(onK).toHaveBeenCalledTimes(1);
  });

  it("config barrel parseFeatureFlagsJson ve resolveFeatureFlag", async () => {
    const cfg = await import("appspresso/config");
    expect(cfg.parseFeatureFlagsJson('{"x":true}')).toEqual({ x: true });
    expect(cfg.resolveFeatureFlag({ y: false }, "y", true)).toBe(false);
    expect(cfg.resolveFeatureFlag({}, "z", true)).toBe(true);
  });

  it("getEffectiveApiBaseUrl is filled from env", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.integration.test");
    const { getEffectiveApiBaseUrl, loadRuntimeConfig } = await import(
      "appspresso/config"
    );
    await loadRuntimeConfig();
    expect(getEffectiveApiBaseUrl()).toBe("https://api.integration.test");
  });

  it("mergeRefs merges callback and object refs", async () => {
    const { mergeRefs } = await import("appspresso/lib/merge-refs");
    const fnRef = vi.fn();
    const objRef: { current: HTMLDivElement | null } = { current: null };
    const merged = mergeRefs(fnRef, objRef);
    const el = document.createElement("div");
    merged(el);
    expect(fnRef).toHaveBeenCalledWith(el);
    expect(objRef.current).toBe(el);
  });

  it("appspresso/components/ui/drawer named export", async () => {
    const d = await import("appspresso/components/ui/drawer");
    expect(d.Drawer).toBeDefined();
    expect(d.DrawerContent).toBeDefined();
    expect(d.DrawerTrigger).toBeDefined();
  });

  it("appspresso/components/ui/tooltip named export", async () => {
    const t = await import("appspresso/components/ui/tooltip");
    expect(t.Tooltip).toBeDefined();
    expect(t.TooltipContent).toBeDefined();
    expect(t.TooltipProvider).toBeDefined();
    expect(t.TooltipTrigger).toBeDefined();
  });

  it("appspresso/lib/public-asset publicAssetUrl", async () => {
    const { publicAssetUrl } = await import("appspresso/lib/public-asset");
    expect(publicAssetUrl("a.svg")).toMatch(/a\.svg$/);
  });

  it("appspresso/lib/dayjs export", async () => {
    const { dayjs, resolveDayjsLocale, setDayjsLocale } = await import(
      "appspresso/lib/dayjs"
    );
    expect(resolveDayjsLocale("tr")).toBe("tr");
    setDayjsLocale("tr");
    expect(dayjs().subtract(2, "hour").fromNow()).toMatch(/2 saat önce/);
    setDayjsLocale("en");
    expect(dayjs().subtract(2, "hour").fromNow()).toMatch(/2 hours ago/);
  });

  it("motion pageTransitionPresets", async () => {
    const { pageTransitionPresets } = await import("appspresso/motion");
    expect(pageTransitionPresets.fade).toBeDefined();
    expect(pageTransitionPresets.zoomIn).toBeDefined();
    expect(pageTransitionPresets.reveal).toBeDefined();
    expect(pageTransitionPresets.slideSpring).toBeDefined();
  });

  it("motion attentionPresets (shake / swing)", async () => {
    const { attentionPresets } = await import("appspresso/motion");
    expect(Array.isArray(attentionPresets.shake.animate.x)).toBe(true);
    expect(attentionPresets.swing.style?.transformOrigin).toBe("top center");
  });

  it("BottomTabBar badge shows count", async () => {
    const { BottomTabBar } = await import("appspresso/components/BottomTabBar");
    const navigate = vi.fn();
    render(
      <MemoryRouter>
        <BottomTabBar
          pathname="/a"
          navigate={navigate}
          items={[
            {
              id: "1",
              to: "/a",
              label: "Alpha",
              badgeCount: 3,
              renderIcon: () => <span>i</span>,
            },
            {
              id: "2",
              to: "/b",
              label: "Bravo",
              badgeCount: 150,
              renderIcon: () => <span>j</span>,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("BottomTabBar click calls navigate", async () => {
    const { BottomTabBar } = await import("appspresso/components/BottomTabBar");
    const navigate = vi.fn();
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <BottomTabBar
          pathname="/a"
          navigate={navigate}
          items={[
            {
              id: "1",
              to: "/a",
              label: "Alpha",
              renderIcon: (active) => <span data-active={active}>a</span>,
            },
            {
              id: "2",
              to: "/b",
              label: "Bravo",
              renderIcon: (active) => <span data-active={active}>b</span>,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Bravo/i }));
    expect(navigate).toHaveBeenCalledWith("/b");
  });

  it("isBottomTabActive rules (dist-lib BottomTabBar)", async () => {
    const { isBottomTabActive } = await import(
      "appspresso/components/BottomTabBar"
    );
    expect(isBottomTabActive("/settings", "/settings", true)).toBe(true);
    expect(isBottomTabActive("/settings/profile", "/settings")).toBe(true);
    expect(isBottomTabActive("/other", "/settings")).toBe(false);
  });
});
