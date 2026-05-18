import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActionSheet } from "@/hooks/useActionSheet";

const showActions = vi.fn();

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "web"),
  },
}));

vi.mock("@capacitor/action-sheet", () => ({
  ActionSheet: { showActions: (...a: unknown[]) => showActions(...a) },
  ActionSheetButtonStyle: {
    Default: "DEFAULT",
    Destructive: "DESTRUCTIVE",
    Cancel: "CANCEL",
  },
}));

describe("useActionSheet", () => {
  afterEach(() => {
    showActions.mockReset();
  });

  it("supported and showActions returns result", async () => {
    showActions.mockResolvedValueOnce({ index: 1 });
    const { result } = renderHook(() => useActionSheet());
    expect(result.current.supported).toBe(true);

    await expect(
      result.current.showActions({
        title: "T",
        options: [{ title: "A" }, { title: "B" }],
      }),
    ).resolves.toEqual({ index: 1 });

    expect(showActions).toHaveBeenCalledWith({
      title: "T",
      options: [{ title: "A" }, { title: "B" }],
    });
  });

  it("isPresenting true for call duration", async () => {
    let resolveSheet: (v: { index: number }) => void = () => {};
    showActions.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSheet = resolve;
        }),
    );

    const { result } = renderHook(() => useActionSheet());
    const p = result.current.showActions({
      title: "T",
      options: [{ title: "A" }],
    });

    await waitFor(() => expect(result.current.isPresenting).toBe(true));

    await act(async () => {
      resolveSheet({ index: 0 });
    });
    await p;

    await waitFor(() => expect(result.current.isPresenting).toBe(false));
  });
});
