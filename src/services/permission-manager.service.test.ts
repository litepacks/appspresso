import { beforeEach, describe, expect, it, vi } from "vitest";

const mockIsNative = vi.hoisted(() => vi.fn(() => false));
const localCheck = vi.hoisted(() => vi.fn());
const localRequest = vi.hoisted(() => vi.fn());
const pushCheck = vi.hoisted(() => vi.fn());
const pushRequest = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNative(),
  },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    checkPermissions: localCheck,
    requestPermissions: localRequest,
  },
}));

vi.mock("@capacitor/push-notifications", () => ({
  PushNotifications: {
    checkPermissions: pushCheck,
    requestPermissions: pushRequest,
  },
}));

import {
  getPermissionStatus,
  requestPermission,
} from "@/services/permission-manager.service";

describe("permission-manager.service", () => {
  beforeEach(() => {
    mockIsNative.mockReturnValue(false);
    localCheck.mockReset();
    localRequest.mockReset();
    pushCheck.mockReset();
    pushRequest.mockReset();
  });

  it("getPermissionStatus returns unavailable on web", async () => {
    expect(await getPermissionStatus("localNotifications")).toBe("unavailable");
    expect(await getPermissionStatus("pushNotifications")).toBe("unavailable");
  });

  it("maps local notification check permissions", async () => {
    mockIsNative.mockReturnValue(true);
    localCheck.mockResolvedValue({ display: "granted" });
    expect(await getPermissionStatus("localNotifications")).toBe("granted");
  });

  it("maps push notification check permissions", async () => {
    mockIsNative.mockReturnValue(true);
    pushCheck.mockResolvedValue({ receive: "denied" });
    expect(await getPermissionStatus("pushNotifications")).toBe("denied");
  });

  it("getPermissionStatus maps prompt and unknown to unavailable", async () => {
    mockIsNative.mockReturnValue(true);
    localCheck.mockResolvedValue({ display: "prompt" });
    expect(await getPermissionStatus("localNotifications")).toBe("prompt");
    pushCheck.mockResolvedValue({ receive: "other" });
    expect(await getPermissionStatus("pushNotifications")).toBe("unavailable");
  });

  it("getPermissionStatus catches errors as unavailable", async () => {
    mockIsNative.mockReturnValue(true);
    localCheck.mockRejectedValue(new Error("boom"));
    expect(await getPermissionStatus("localNotifications")).toBe("unavailable");
  });

  it("requestPermission maps local notifications", async () => {
    mockIsNative.mockReturnValue(true);
    localRequest.mockResolvedValue({ display: "prompt" });
    expect(await requestPermission("localNotifications")).toBe("prompt");
  });

  it("requestPermission catches errors as denied", async () => {
    mockIsNative.mockReturnValue(true);
    pushRequest.mockRejectedValue(new Error("nope"));
    expect(await requestPermission("pushNotifications")).toBe("denied");
  });
});
