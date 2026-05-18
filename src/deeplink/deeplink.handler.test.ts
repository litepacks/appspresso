import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleDeepLink } from "@/deeplink/deeplink.handler";
import { lastDeepLinkSnapshotAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

describe("handleDeepLink", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    navigate.mockClear();
    appStore.set(lastDeepLinkSnapshotAtom, null);
  });

  it("navigates home when URL does not parse", () => {
    handleDeepLink("https://evil.test/path", navigate);
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    const snap = appStore.get(lastDeepLinkSnapshotAtom);
    expect(snap?.parseOk).toBe(false);
  });

  it("navigates to resolved route on valid deep link", () => {
    handleDeepLink("myapp://referral?code=z", navigate);
    expect(navigate).toHaveBeenCalledWith("/referral?code=z");
    expect(appStore.get(lastDeepLinkSnapshotAtom)?.parseOk).toBe(true);
  });

  it("navigates home when path is unknown", () => {
    handleDeepLink("myapp://unknown", navigate);
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
