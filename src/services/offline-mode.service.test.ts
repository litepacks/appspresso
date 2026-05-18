import { describe, expect, it, vi } from "vitest";
import {
  notifyConnectivityChange,
  onConnectivityChange,
  onOfflineEnter,
  onOnlineEnter,
} from "./offline-mode.service";

describe("offline-mode.service", () => {
  it("notifyConnectivityChange: only offline listeners on offline transition", () => {
    const offline = vi.fn();
    const online = vi.fn();
    const uo = onOfflineEnter(offline);
    const up = onOnlineEnter(online);
    notifyConnectivityChange(
      { connected: true, connectionType: "wifi" },
      { connected: false, connectionType: "none" },
    );
    expect(offline).toHaveBeenCalledTimes(1);
    expect(online).not.toHaveBeenCalled();
    uo();
    up();
  });

  it("notifyConnectivityChange: only online listeners on online transition", () => {
    const offline = vi.fn();
    const online = vi.fn();
    const uo = onOfflineEnter(offline);
    const up = onOnlineEnter(online);
    notifyConnectivityChange(
      { connected: false, connectionType: "none" },
      { connected: true, connectionType: "wifi" },
    );
    expect(online).toHaveBeenCalledTimes(1);
    expect(offline).not.toHaveBeenCalled();
    uo();
    up();
  });

  it("onConnectivityChange called on every update", () => {
    const fn = vi.fn();
    const unsub = onConnectivityChange(fn);
    notifyConnectivityChange(
      { connected: true, connectionType: "wifi" },
      { connected: true, connectionType: "4g" },
    );
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ connectionType: "4g" }),
    );
    unsub();
  });
});
