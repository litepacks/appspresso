import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { afterEach, describe, expect, it, vi } from "vitest";
import { scheduleTestNotification } from "@/services/local-notification.service";
import {
  getPermissionStatus,
  requestPermission,
} from "@/services/permission-manager.service";

vi.mock("@/services/permission-manager.service", () => ({
  getPermissionStatus: vi.fn(),
  requestPermission: vi.fn(),
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: vi.fn(),
  },
}));

describe("scheduleTestNotification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getPermissionStatus).mockReset();
    vi.mocked(requestPermission).mockReset();
    vi.mocked(LocalNotifications.schedule).mockReset();
  });

  it("fails on web with web reason", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
    await expect(scheduleTestNotification("t", "b")).resolves.toEqual({
      ok: false,
      reason: "web",
    });
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
  });

  it("permission granted and schedule succeeds", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    vi.mocked(getPermissionStatus).mockResolvedValue("granted");
    vi.mocked(LocalNotifications.schedule).mockResolvedValue({
      notifications: [{ id: 1 }],
    });

    await expect(
      scheduleTestNotification("Title", "Body", { delayMs: 2000 }),
    ).resolves.toEqual({ ok: true });

    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(LocalNotifications.schedule).mock.calls[0][0];
    expect(arg.notifications[0].title).toBe("Title");
    expect(arg.notifications[0].body).toBe("Body");
    expect(arg.notifications[0].schedule?.at).toBeInstanceOf(Date);
  });

  it("schedules when prompt + request yields granted", async () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    vi.mocked(getPermissionStatus).mockResolvedValue("prompt");
    vi.mocked(requestPermission).mockResolvedValue("granted");
    vi.mocked(LocalNotifications.schedule).mockResolvedValue({
      notifications: [{ id: 1 }],
    });

    await expect(scheduleTestNotification("a", "b")).resolves.toEqual({
      ok: true,
    });
    expect(requestPermission).toHaveBeenCalledWith("localNotifications");
  });
});
