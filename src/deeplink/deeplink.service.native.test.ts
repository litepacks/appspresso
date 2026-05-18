import { afterEach, describe, expect, it, vi } from "vitest";

const isNative = vi.hoisted(() => vi.fn(() => true));
const getLaunchUrl = vi.hoisted(() => vi.fn());
const addListener = vi.hoisted(() => vi.fn());
const handleDeepLink = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNative(),
  },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    getLaunchUrl: () => getLaunchUrl(),
    addListener: (...a: unknown[]) => addListener(...a),
  },
}));

vi.mock("@/deeplink/deeplink.handler", () => ({
  handleDeepLink: (url: string, nav: unknown) => handleDeepLink(url, nav),
}));

import {
  cleanupDeepLinks,
  handleInitialDeepLink,
  handleRuntimeDeepLinks,
  initDeepLinks,
} from "@/deeplink/deeplink.service";

describe("deeplink.service (native)", () => {
  afterEach(async () => {
    isNative.mockReturnValue(true);
    getLaunchUrl.mockReset();
    addListener.mockReset();
    handleDeepLink.mockReset();
    await cleanupDeepLinks();
  });

  it("handleInitialDeepLink navigates when cold-start url exists", async () => {
    const nav = vi.fn();
    getLaunchUrl.mockResolvedValue({ url: "myapp://open/settings" });

    await handleInitialDeepLink(nav);

    expect(handleDeepLink).toHaveBeenCalledWith("myapp://open/settings", nav);
  });

  it("handleInitialDeepLink ignores missing url", async () => {
    const nav = vi.fn();
    getLaunchUrl.mockResolvedValue({ url: undefined });

    await handleInitialDeepLink(nav);

    expect(handleDeepLink).not.toHaveBeenCalled();
  });

  it("handleInitialDeepLink swallows getLaunchUrl errors", async () => {
    const nav = vi.fn();
    getLaunchUrl.mockRejectedValue(new Error("n/a"));

    await expect(handleInitialDeepLink(nav)).resolves.toBeUndefined();
    expect(handleDeepLink).not.toHaveBeenCalled();
  });

  it("handleRuntimeDeepLinks registers listener that forwards urls", async () => {
    const nav = vi.fn();
    addListener.mockResolvedValue({ remove: vi.fn() });

    await handleRuntimeDeepLinks(nav);

    expect(addListener).toHaveBeenCalledWith(
      "appUrlOpen",
      expect.any(Function),
    );
    const handler = addListener.mock.calls[0][1] as (p: {
      url: string;
    }) => void;
    handler({ url: "myapp://x" });
    expect(handleDeepLink).toHaveBeenCalledWith("myapp://x", nav);
  });

  it("initDeepLinks runs initial + runtime once", async () => {
    const nav = vi.fn();
    getLaunchUrl.mockResolvedValue({ url: "myapp://a" });
    addListener.mockResolvedValue({ remove: vi.fn() });

    await initDeepLinks(nav);
    await initDeepLinks(nav);

    expect(getLaunchUrl).toHaveBeenCalledTimes(1);
    expect(handleDeepLink).toHaveBeenCalledWith("myapp://a", nav);
  });

  it("cleanupDeepLinks removes listener", async () => {
    const nav = vi.fn();
    const remove = vi.fn().mockResolvedValue(undefined);
    getLaunchUrl.mockResolvedValue({});
    addListener.mockResolvedValue({ remove });

    await initDeepLinks(nav);
    await cleanupDeepLinks();

    expect(remove).toHaveBeenCalled();
  });
});
