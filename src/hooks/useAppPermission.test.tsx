import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppPermission } from "@/hooks/useAppPermission";

const pmMocks = vi.hoisted(() => ({
  getPermissionStatus: vi.fn(),
  requestPermission: vi.fn(),
}));

vi.mock("@/services/permission-manager.service", () => ({
  getPermissionStatus: pmMocks.getPermissionStatus,
  requestPermission: pmMocks.requestPermission,
}));

describe("useAppPermission", () => {
  beforeEach(() => {
    pmMocks.getPermissionStatus.mockResolvedValue("prompt");
    pmMocks.requestPermission.mockResolvedValue("granted");
  });

  it("loads status on mount", async () => {
    const { result } = renderHook(() => useAppPermission("localNotifications"));
    await waitFor(() => expect(result.current.status).toBe("prompt"));
  });

  it("request updates status", async () => {
    const { result } = renderHook(() => useAppPermission("pushNotifications"));
    await waitFor(() => expect(result.current.status).toBe("prompt"));
    const next = await act(async () => result.current.request());
    expect(next).toBe("granted");
    await waitFor(() => expect(result.current.status).toBe("granted"));
  });
});
