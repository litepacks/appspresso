import { beforeEach, describe, expect, it } from "vitest";
import {
  webOutboxClear,
  webOutboxEnqueue,
  webOutboxList,
  webOutboxShift,
} from "@/sync/web-outbox";

describe("web-outbox", () => {
  beforeEach(() => {
    webOutboxClear();
  });

  it("enqueue, list, shift, and clear", () => {
    webOutboxEnqueue({ operation: "ping", payload: { n: 1 } });
    webOutboxEnqueue({ operation: "pong", payload: { n: 2 } });
    expect(webOutboxList()).toHaveLength(2);

    const first = webOutboxShift();
    expect(first?.operation).toBe("ping");
    expect(webOutboxList()).toHaveLength(1);

    webOutboxClear();
    expect(webOutboxList()).toHaveLength(0);
  });

  it("ignores corrupt storage", () => {
    localStorage.setItem("appkit_web_sync_outbox", "not-json");
    expect(webOutboxList()).toEqual([]);
  });
});
