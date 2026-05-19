import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applySafeAreaClass,
  hideSplashScreen,
  initAppearance,
  setStatusBarTheme,
} from "@/services/appearance.service";

const isNative = vi.hoisted(() => vi.fn(() => false));
const getPlatform = vi.hoisted(() => vi.fn(() => "web"));
const mockSplashHide = vi.hoisted(() => vi.fn());
const mockStatusBarHide = vi.hoisted(() => vi.fn());
const mockSetStyle = vi.hoisted(() => vi.fn());
const mockSetBackgroundColor = vi.hoisted(() => vi.fn());
const mockSetOverlaysWebView = vi.hoisted(() => vi.fn());
const mockShow = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNative(),
    getPlatform: () => getPlatform(),
  },
}));

vi.mock("@capacitor/splash-screen", () => ({
  SplashScreen: { hide: (...a: unknown[]) => mockSplashHide(...a) },
}));

vi.mock("@capacitor/status-bar", () => ({
  StatusBar: {
    hide: (...a: unknown[]) => mockStatusBarHide(...a),
    show: (...a: unknown[]) => mockShow(...a),
    setStyle: (...a: unknown[]) => mockSetStyle(...a),
    setBackgroundColor: (...a: unknown[]) => mockSetBackgroundColor(...a),
    setOverlaysWebView: (...a: unknown[]) => mockSetOverlaysWebView(...a),
  },
  Style: { Dark: "DARK", Light: "LIGHT" },
}));

vi.mock("@/build/injected-app-meta", () => ({
  getInjectedAppMeta: vi.fn(() => null),
}));

describe("appearance.service (web)", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("cap-safe");
  });

  it("applySafeAreaClass adds cap-safe to html element", () => {
    applySafeAreaClass();
    expect(document.documentElement.classList.contains("cap-safe")).toBe(true);
  });

  it("initAppearance applies safe area class", async () => {
    await initAppearance("dark");
    expect(document.documentElement.classList.contains("cap-safe")).toBe(true);
  });

  it("hideSplashScreen resolves on web", async () => {
    await expect(hideSplashScreen()).resolves.toBeUndefined();
  });
});

describe("appearance.service (native)", () => {
  beforeEach(async () => {
    isNative.mockReturnValue(true);
    getPlatform.mockReturnValue("android");
    const { getInjectedAppMeta } = await import("@/build/injected-app-meta");
    vi.mocked(getInjectedAppMeta).mockReturnValue(null);
    mockSplashHide.mockReset().mockResolvedValue(undefined);
    mockStatusBarHide.mockReset().mockResolvedValue(undefined);
    mockSetStyle.mockReset().mockResolvedValue(undefined);
    mockSetBackgroundColor.mockReset().mockResolvedValue(undefined);
    mockSetOverlaysWebView.mockReset().mockResolvedValue(undefined);
    mockShow.mockReset().mockResolvedValue(undefined);
    document.documentElement.classList.remove("cap-safe");
  });

  it("hideSplashScreen calls SplashScreen.hide on native", async () => {
    await hideSplashScreen(300);
    expect(mockSplashHide).toHaveBeenCalledWith({ fadeOutDuration: 300 });
  });

  it("setStatusBarTheme applies dark style on Android", async () => {
    await setStatusBarTheme("dark");
    expect(mockSetStyle).toHaveBeenCalledWith({ style: "DARK" });
    expect(mockSetBackgroundColor).toHaveBeenCalledWith({ color: "#020617" });
  });

  it("setStatusBarTheme skips when status bar hidden in meta", async () => {
    const { getInjectedAppMeta } = await import("@/build/injected-app-meta");
    vi.mocked(getInjectedAppMeta).mockReturnValue({
      statusBar: { hidden: true },
    });
    await setStatusBarTheme("light");
    expect(mockSetStyle).not.toHaveBeenCalled();
  });
});
