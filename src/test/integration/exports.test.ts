import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("appspresso dist-lib module resolution", () => {
  it("appspresso CLI help includes native", () => {
    const bin = path.join(repoRoot, "bin", "appspresso.mjs");
    const out = execFileSync(process.execPath, [bin, "help"], {
      encoding: "utf8",
    });
    expect(out).toContain("native");
    expect(out).toContain("sync");
    expect(out).toContain("doctor");
  });

  it("exposes api/http with an axios instance", async () => {
    const { http } = await import("appspresso/api/http");
    expect(http).toBeDefined();
    expect(typeof http.get).toBe("function");
    expect(typeof http.post).toBe("function");
  });

  it("api/upload multipart helpers", async () => {
    const mod = await import("appspresso/api/upload");
    expect(typeof mod.uploadMultipart).toBe("function");
    expect(typeof mod.appendPartsToFormData).toBe("function");
    expect(typeof mod.filesFromFileInput).toBe("function");
    expect(typeof mod.filesToParts).toBe("function");
  });

  it("hooks/useMultipartUpload", async () => {
    const mod = await import("appspresso/hooks/useMultipartUpload");
    expect(typeof mod.useMultipartUpload).toBe("function");
  });

  it("exposes unified config entry", async () => {
    const config = await import("appspresso/config");
    expect(typeof config.getEnvConfig).toBe("function");
    expect(config.STORAGE_KEY_PREFIX).toBeDefined();
    expect(config.appspressoPackageConfig.mount.rootElementId).toBe("root");
    expect(config.appspressoPackageConfig.revenuecat.entitlementId).toBe("pro");
    expect(typeof config.getAppspressoConfig).toBe("function");
    const full = config.getAppspressoConfig();
    expect(full.package.storage.keyPrefix).toBe("appkit_");
    expect(full.env).toBeDefined();
  });

  it("i18n mergeI18nJsonBundles", async () => {
    const i18nMod = await import("appspresso/i18n");
    expect(typeof i18nMod.mergeI18nJsonBundles).toBe("function");
    expect(typeof i18nMod.addI18nJsonBundle).toBe("function");
    i18nMod.mergeI18nJsonBundles({
      "integration-test-ns": { en: { ping: "pong" } },
    });
    expect(i18nMod.default.hasResourceBundle("en", "integration-test-ns")).toBe(
      true,
    );
  });

  it("i18n mergeI18nJsonBundlesFromViteGlob", async () => {
    const i18nMod = await import("appspresso/i18n");
    expect(typeof i18nMod.mergeI18nJsonBundlesFromViteGlob).toBe("function");
    expect(typeof i18nMod.parseLocalePathFromViteGlobKey).toBe("function");
    i18nMod.mergeI18nJsonBundlesFromViteGlob(
      { "./locales/integration-vite-ns/en.json": { glob: true } },
      { logDevWarnings: false },
    );
    expect(i18nMod.default.hasResourceBundle("en", "integration-vite-ns")).toBe(
      true,
    );
  });

  it("template/Home resolves (alias of pages)", async () => {
    const mod = await import("appspresso/template/Home");
    expect(mod.default).toBeDefined();
  });

  it("app/mount bootAppspresso", async () => {
    const { bootAppspresso, bootAppspressoHost } = await import(
      "appspresso/app/mount"
    );
    expect(typeof bootAppspresso).toBe("function");
    expect(typeof bootAppspressoHost).toBe("function");
  });

  it("app/mount-host standalone", async () => {
    const { bootAppspressoHost } = await import("appspresso/app/mount-host");
    expect(typeof bootAppspressoHost).toBe("function");
  });

  it("app/HostAppFrame", async () => {
    const { HostAppFrame } = await import("appspresso/app/HostAppFrame");
    expect(typeof HostAppFrame).toBe("function");
  });

  it("theme/apply-theme", async () => {
    const { resolveTheme } = await import("appspresso/theme/apply-theme");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("system", true)).toBe("dark");
  });

  it("theme/apply-palette", async () => {
    const { applyAppspressoThemeForMode } = await import(
      "appspresso/theme/apply-palette"
    );
    expect(typeof applyAppspressoThemeForMode).toBe("function");
  });

  it("theme/fonts", async () => {
    const { FONT_CSS_VAR_NAMES } = await import("appspresso/theme/fonts");
    expect(FONT_CSS_VAR_NAMES.sans).toBe("--font-sans");
    expect(FONT_CSS_VAR_NAMES.mono).toBe("--font-mono");
  });

  it("state/store appStore", async () => {
    const { appStore } = await import("appspresso/state/store");
    expect(appStore).toBeDefined();
    expect(typeof appStore.get).toBe("function");
  });

  it("hooks/useAppspressoBootstrap", async () => {
    const mod = await import("appspresso/hooks/useAppspressoBootstrap");
    expect(typeof mod.useAppspressoBootstrap).toBe("function");
  });

  it("hooks/useSqliteSetting", async () => {
    const mod = await import("appspresso/hooks/useSqliteSetting");
    expect(typeof mod.useSqliteSetting).toBe("function");
  });

  it("deeplink.parser", async () => {
    const { parseDeepLink } = await import(
      "appspresso/deeplink/deeplink.parser"
    );
    const r = parseDeepLink("myapp://referral?code=x");
    expect(r?.pathKey).toBe("referral");
    expect(r?.params.code).toBe("x");
  });

  it("build/vite-config", async () => {
    const { createAppspressoViteConfig, appspressoTailwindContent } =
      await import("appspresso/build/vite-config");
    const { parseInjectedDefine } = await import("appspresso/build/inject-env");
    expect(appspressoTailwindContent.length).toBeGreaterThan(0);
    expect(parseInjectedDefine<{ a: number }>('"{\\"a\\":1}"')?.a).toBe(1);
    expect(parseInjectedDefine("null")).toBeNull();
    const cfg = createAppspressoViteConfig();
    expect(cfg.define).toBeDefined();
    expect(cfg.define?.__APSPRESSO_HOST__).toContain("root");
    expect(cfg.define?.__APSPRESSO_APP__).toBeDefined();
  });

  it("build/tailwind-preset", async () => {
    const { appspressoTailwindPreset } = await import(
      "appspresso/build/tailwind-preset"
    );
    expect(appspressoTailwindPreset.darkMode).toEqual(["class"]);
    expect(appspressoTailwindPreset.theme?.extend?.colors).toBeDefined();
  });

  it("lib/utils cn", async () => {
    const { cn } = await import("appspresso/lib/utils");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("lib/gradient", async () => {
    const mod = await import("appspresso/lib/gradient");
    expect(typeof mod.appspressoGradientBgClass).toBe("function");
    expect(mod.appspressoGradientBg.brand).toContain(
      "appspresso-gradient-brand",
    );
  });

  it("lib/declarative-routes helpers", async () => {
    const mod = await import("appspresso/lib/declarative-routes");
    expect(typeof mod.lazyRouteFromImport).toBe("function");
    expect(typeof mod.declarativeLazyLeavesToRouteObjects).toBe("function");
    expect(typeof mod.declarativeElementLeavesToRouteObjects).toBe("function");
  });

  it("lib/reportError", async () => {
    const { reportError } = await import("appspresso/lib/reportError");
    expect(() =>
      reportError(new Error("integration"), { it: true }),
    ).not.toThrow();
  });

  it("hooks/useNetwork & useAppState", async () => {
    const net = await import("appspresso/hooks/useNetwork");
    const life = await import("appspresso/hooks/useAppState");
    expect(typeof net.useNetwork).toBe("function");
    expect(typeof life.useAppState).toBe("function");
  });

  it("hooks/useDeepLinkListener & useSecureStorage", async () => {
    const dl = await import("appspresso/hooks/useDeepLinkListener");
    const sec = await import("appspresso/hooks/useSecureStorage");
    expect(typeof dl.useDeepLinkListener).toBe("function");
    expect(typeof sec.useSecureStorage).toBe("function");
  });

  it("components/form", async () => {
    const mod = await import("appspresso/components/form");
    expect(typeof mod.Form).toBe("function");
    expect(typeof mod.FormField).toBe("function");
    expect(typeof mod.useFormField).toBe("function");
  });

  it("components/shell AppMain + pane variants", async () => {
    const shell = await import("appspresso/components/shell");
    expect(shell.AppMain).toBeDefined();
    expect(shell.AppMainPane).toBeDefined();
    expect(shell.AppMain.displayName).toBe("AppMain");
    expect(shell.AppMainPane.displayName).toBe("AppMainPane");
    expect(typeof shell.appMainVariants).toBe("function");
    expect(typeof shell.appMainPaneVariants).toBe("function");
  });

  it("components/ui/text", async () => {
    const { Text } = await import("appspresso/components/ui/text");
    expect(Text.displayName).toBe("Text");
  });

  it("components/ui/toggle", async () => {
    const { Toggle } = await import("appspresso/components/ui/toggle");
    expect(Toggle.displayName).toBe("Toggle");
  });

  it("components/ui/icon", async () => {
    const { Icon } = await import("appspresso/components/ui/icon");
    expect(typeof Icon).toBe("function");
  });

  it("components/ui/pull-to-refresh", async () => {
    const { PullToRefresh } = await import(
      "appspresso/components/ui/pull-to-refresh"
    );
    expect(typeof PullToRefresh).toBe("function");
  });

  it("components/ui/search-input", async () => {
    const { SearchInput } = await import(
      "appspresso/components/ui/search-input"
    );
    expect(SearchInput.displayName).toBe("SearchInput");
  });

  it("components/ui/image", async () => {
    const mod = await import("appspresso/components/ui/image");
    expect(mod.Image.displayName).toBe("Image");
    expect(mod.default).toBe(mod.Image);
    expect(
      mod.DEFAULT_IMAGE_FALLBACK_SRC.startsWith("data:image/svg+xml"),
    ).toBe(true);
  });

  it("components/ui/checkbox", async () => {
    const { Checkbox } = await import("appspresso/components/ui/checkbox");
    expect(Checkbox.displayName).toBe("Checkbox");
  });

  it("components/ui/badge", async () => {
    const { Badge } = await import("appspresso/components/ui/badge");
    expect(Badge.displayName).toBe("Badge");
  });

  it("components/ui/radio-group", async () => {
    const mod = await import("appspresso/components/ui/radio-group");
    expect(mod.RadioGroup.displayName).toBe("RadioGroup");
    expect(mod.RadioGroupItem.displayName).toBe("RadioGroupItem");
  });

  it("components/ui/segment", async () => {
    const mod = await import("appspresso/components/ui/segment");
    expect(mod.Segment.displayName).toBe("Segment");
    expect(mod.SegmentItem.displayName).toBe("SegmentItem");
  });

  it("components/ui/range", async () => {
    const mod = await import("appspresso/components/ui/range");
    expect(mod.Range.displayName).toBe("Range");
    expect(mod.RangeTrack.displayName).toBe("RangeTrack");
    expect(mod.RangeHighlight.displayName).toBe("RangeHighlight");
    expect(mod.RangeThumb.displayName).toBe("RangeThumb");
  });

  it("components/ui/select", async () => {
    const { SelectTrigger } = await import("appspresso/components/ui/select");
    expect(SelectTrigger.displayName).toBeDefined();
  });

  it("components/LoadingFallback", async () => {
    const { LoadingFallback } = await import(
      "appspresso/components/LoadingFallback"
    );
    expect(typeof LoadingFallback).toBe("function");
  });

  it("lib/app-events createAppEventBus", async () => {
    const { createAppEventBus } = await import("appspresso/lib/app-events");
    expect(typeof createAppEventBus).toBe("function");
    const bus = createAppEventBus<{ e: undefined }>();
    expect(typeof bus.emit).toBe("function");
    expect(typeof bus.on).toBe("function");
    expect(typeof bus.clear).toBe("function");
  });

  it("hooks/useAppEventSubscription", async () => {
    const mod = await import("appspresso/hooks/useAppEventSubscription");
    expect(typeof mod.useAppEventSubscription).toBe("function");
  });

  it("hooks/useFeatureFlag", async () => {
    const mod = await import("appspresso/hooks/useFeatureFlag");
    expect(typeof mod.useFeatureFlag).toBe("function");
  });

  it("config getFeatureFlags and isFeatureEnabled", async () => {
    const { getFeatureFlags, isFeatureEnabled } = await import(
      "appspresso/config"
    );
    expect(typeof getFeatureFlags).toBe("function");
    expect(typeof isFeatureEnabled).toBe("function");
  });

  it("app/events appEvents singleton", async () => {
    const { appEvents } = await import("appspresso/app/events");
    expect(appEvents).toBeDefined();
    expect(typeof appEvents.emit).toBe("function");
  });
});
