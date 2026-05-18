import { describe, expect, it, vi } from "vitest";
import {
  cleanupDeepLinks,
  handleInitialDeepLink,
  initDeepLinks,
} from "@/deeplink/deeplink.service";

describe("deeplink.service (web)", () => {
  it("init and cleanup complete without throwing", async () => {
    const nav = vi.fn();
    await initDeepLinks(nav);
    await cleanupDeepLinks();
    await handleInitialDeepLink(nav);
    expect(nav).not.toHaveBeenCalled();
  });
});
