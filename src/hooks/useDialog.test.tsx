import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDialog } from "@/hooks/useDialog";

const alertFn = vi.fn();
const confirmFn = vi.fn();
const promptFn = vi.fn();

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "web"),
  },
}));

vi.mock("@capacitor/dialog", () => ({
  Dialog: {
    alert: (...a: unknown[]) => alertFn(...a),
    confirm: (...a: unknown[]) => confirmFn(...a),
    prompt: (...a: unknown[]) => promptFn(...a),
  },
}));

describe("useDialog", () => {
  afterEach(() => {
    alertFn.mockReset();
    confirmFn.mockReset();
    promptFn.mockReset();
  });

  it("confirm ve supported", async () => {
    confirmFn.mockResolvedValueOnce({ value: true });
    const { result } = renderHook(() => useDialog());
    expect(result.current.supported).toBe(true);

    await expect(
      result.current.confirm({ message: "Emin misiniz?" }),
    ).resolves.toEqual({ value: true });

    expect(confirmFn).toHaveBeenCalledWith({ message: "Emin misiniz?" });
  });

  it("isPresenting true for call duration", async () => {
    let resolveConfirm: (v: { value: boolean }) => void = () => {};
    confirmFn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConfirm = resolve;
        }),
    );

    const { result } = renderHook(() => useDialog());
    const p = result.current.confirm({ message: "?" });

    await waitFor(() => expect(result.current.isPresenting).toBe(true));

    await act(async () => {
      resolveConfirm({ value: false });
    });
    await p;

    await waitFor(() => expect(result.current.isPresenting).toBe(false));
  });
});
