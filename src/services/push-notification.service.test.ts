import { beforeEach, describe, expect, it, vi } from "vitest";
import { lastNotificationAtom, pushNotificationTokenAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const isNative = vi.hoisted(() => vi.fn(() => false));
const isPluginAvailable = vi.hoisted(() => vi.fn(() => true));
const getPermissionStatus = vi.hoisted(() => vi.fn());
const mockRegister = vi.hoisted(() => vi.fn());
const mockAddListener = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNative(),
    isPluginAvailable: () => isPluginAvailable(),
    getPlatform: () => (isNative() ? "android" : "web"),
  },
}));

vi.mock("@capacitor/push-notifications", () => ({
  PushNotifications: {
    register: () => mockRegister(),
    addListener: (...a: unknown[]) => mockAddListener(...a),
  },
}));

vi.mock("@/services/permission-manager.service", () => ({
  getPermissionStatus: (...a: unknown[]) => getPermissionStatus(...a),
}));

import { logger } from "@/lib/logger";
import {
  initPushListeners,
  registerForPush,
} from "@/services/push-notification.service";

describe("push-notification.service", () => {
  beforeEach(() => {
    isNative.mockReturnValue(false);
    isPluginAvailable.mockReturnValue(true);
    getPermissionStatus.mockReset();
    mockRegister.mockReset();
    mockAddListener.mockReset();
    appStore.set(pushNotificationTokenAtom, null);
    appStore.set(lastNotificationAtom, null);
  });

  it("registerForPush is no-op on web", async () => {
    await registerForPush();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("registerForPush bails when permission is not granted", async () => {
    isNative.mockReturnValue(true);
    getPermissionStatus.mockResolvedValue("denied");
    await registerForPush();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("registerForPush calls PushNotifications.register when granted", async () => {
    isNative.mockReturnValue(true);
    getPermissionStatus.mockResolvedValue("granted");
    mockRegister.mockResolvedValue(undefined);
    await registerForPush();
    expect(mockRegister).toHaveBeenCalledOnce();
  });

  it("registerForPush warns when register throws", async () => {
    isNative.mockReturnValue(true);
    getPermissionStatus.mockResolvedValue("granted");
    mockRegister.mockRejectedValue(new Error("reg-fail"));
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    await registerForPush();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("initPushListeners returns noop when not native", async () => {
    const disposer = await initPushListeners();
    await disposer();
    expect(mockAddListener).not.toHaveBeenCalled();
  });

  it("initPushListeners wires listeners and disposer removes them", async () => {
    isNative.mockReturnValue(true);
    const remove = vi.fn().mockResolvedValue(undefined);
    mockAddListener.mockResolvedValue({ remove });

    const disposer = await initPushListeners();
    expect(mockAddListener).toHaveBeenCalled();

    const regHandler = mockAddListener.mock.calls.find(
      (c) => c[0] === "registration",
    )?.[1] as (t: { value: string }) => void;
    regHandler?.({ value: "tok" });
    expect(appStore.get(pushNotificationTokenAtom)).toBe("tok");

    const errHandler = mockAddListener.mock.calls.find(
      (c) => c[0] === "registrationError",
    )?.[1] as () => void;
    errHandler?.();
    expect(appStore.get(pushNotificationTokenAtom)).toBeNull();

    const actionHandler = mockAddListener.mock.calls.find(
      (c) => c[0] === "pushNotificationActionPerformed",
    )?.[1] as (e: { notification: { title?: string } }) => void;
    actionHandler?.({ notification: { title: "Hi" } });
    expect(appStore.get(lastNotificationAtom)).toBe("Hi");

    actionHandler?.({ notification: {} });
    expect(appStore.get(lastNotificationAtom)).toBe("notification");

    await disposer();
    expect(remove).toHaveBeenCalledTimes(3);
  });
});
