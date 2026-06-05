import { describe, expect, it } from "vitest";
import { createFakeSyncProvider } from "./fake-provider";

describe("createFakeSyncProvider", () => {
  it("records push and pull calls", async () => {
    const provider = createFakeSyncProvider({
      pullChanges: [
        {
          entityType: "todo",
          remoteId: "r1",
          version: 1,
          updatedAt: new Date().toISOString(),
          data: { title: "x" },
        },
      ],
    });

    const push = await provider.push({
      id: "1",
      idempotencyKey: "k",
      entityType: "todo",
      action: "create",
      payload: {},
      attempts: 0,
    });
    expect(push.ok).toBe(true);

    const pull = await provider.pull?.(null, {});
    expect(pull?.changes).toHaveLength(1);
    expect(provider.pushCalls).toHaveLength(1);
    expect(provider.pullCalls).toEqual([""]);
  });
});
