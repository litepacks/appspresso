import { Capacitor } from "@capacitor/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dispatchBackgroundRunnerEvent,
  isBackgroundRunnerAvailable,
  resetBackgroundRunnerAvailabilityProbe,
} from "./background-runner.service";

const checkPermissions = vi.fn();
const dispatchEvent = vi.fn();

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock("@capacitor/background-runner", () => ({
  BackgroundRunner: {
    checkPermissions,
    dispatchEvent,
  },
}));

vi.mock("@/build/injected-app-meta", () => ({
  getInjectedAppMeta: () => ({
    id: "com.example.app",
    backgroundRunner: { label: "com.example.app.background" },
  }),
}));

describe("background-runner.service", () => {
  beforeEach(() => {
    resetBackgroundRunnerAvailabilityProbe();
    checkPermissions.mockReset();
    dispatchEvent.mockReset();
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
  });

  it("unavailable on web", async () => {
    await expect(isBackgroundRunnerAvailable()).resolves.toBe(false);
    await expect(
      dispatchBackgroundRunnerEvent({ event: "appspressoDemoPing" }),
    ).rejects.toThrow(/native builds/i);
  });

  it("unavailable on native web stub", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    checkPermissions.mockRejectedValue(new Error("not implemented"));

    await expect(isBackgroundRunnerAvailable()).resolves.toBe(false);
  });

  it("dispatchEvent is called on native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    checkPermissions.mockResolvedValue({});
    dispatchEvent.mockResolvedValue({ ok: true });

    await expect(isBackgroundRunnerAvailable()).resolves.toBe(true);
    await expect(
      dispatchBackgroundRunnerEvent({
        event: "appspressoDemoPing",
        details: { source: "test" },
      }),
    ).resolves.toEqual({ ok: true });

    expect(dispatchEvent).toHaveBeenCalledWith({
      label: "com.example.app.background",
      event: "appspressoDemoPing",
      details: { source: "test" },
    });
  });
});
