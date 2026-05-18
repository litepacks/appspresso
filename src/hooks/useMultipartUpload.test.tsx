import { act, renderHook, waitFor } from "@testing-library/react";
import type { AxiosProgressEvent } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUploadMultipart } = vi.hoisted(() => ({
  mockUploadMultipart: vi.fn(),
}));

vi.mock("@/api/upload", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/upload")>();
  return {
    ...actual,
    uploadMultipart: mockUploadMultipart,
  };
});

import { useMultipartUpload } from "./useMultipartUpload";

function progressEvent(partial: {
  loaded: number;
  total?: number | undefined;
}): AxiosProgressEvent {
  return {
    loaded: partial.loaded,
    total: partial.total,
    bytes: partial.loaded,
    lengthComputable: partial.total != null && partial.total > 0,
    progress: undefined,
    estimated: undefined,
    rate: undefined,
    upload: true,
  } as AxiosProgressEvent;
}

describe("useMultipartUpload", () => {
  beforeEach(() => {
    mockUploadMultipart.mockReset();
  });

  it("idle initially", () => {
    const { result } = renderHook(() => useMultipartUpload());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reset sets idle state", () => {
    const { result } = renderHook(() => useMultipartUpload<{ id: number }>());
    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("success and data on successful upload", async () => {
    mockUploadMultipart.mockResolvedValue({ id: 42 });
    const { result } = renderHook(() => useMultipartUpload<{ id: number }>());
    const file = new File(["x"], "a.txt");
    let returned: { id: number } | undefined;
    await act(async () => {
      returned = await result.current.upload({
        path: "/up",
        parts: [{ fieldName: "file", file }],
      });
    });
    expect(returned).toEqual({ id: 42 });
    expect(result.current.state).toEqual({ status: "success", data: { id: 42 } });
    expect(mockUploadMultipart).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/up",
        parts: [{ fieldName: "file", file }],
      }),
    );
  });

  it("error state and rethrows on failure", async () => {
    const boom = new Error("fail");
    mockUploadMultipart.mockRejectedValue(boom);
    const { result } = renderHook(() => useMultipartUpload());

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.upload({
          path: "/up",
          parts: [{ fieldName: "f", file: new File([], "x") }],
        });
      } catch (e) {
        caught = e;
      }
    });

    expect(result.current.state).toEqual({ status: "error", error: boom });
    expect(caught).toBe(boom);
  });

  it("uploading while loading; progressPercent when total known", async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });

    mockUploadMultipart.mockImplementation(async (opts) => {
      opts.onUploadProgress?.(progressEvent({ loaded: 50, total: 100 }));
      await barrier;
      return { done: true };
    });

    const { result } = renderHook(() => useMultipartUpload<{ done: boolean }>());

    let uploadPromise: Promise<{ done: boolean }>;
    act(() => {
      uploadPromise = result.current.upload({
        path: "/p",
        parts: [{ fieldName: "f", file: new Blob([]) }],
      });
    });

    await waitFor(() => {
      expect(result.current.state).toMatchObject({
        status: "uploading",
        progressPercent: 50,
      });
    });

    await act(async () => {
      release();
      await uploadPromise!;
    });

    expect(result.current.state).toEqual({ status: "success", data: { done: true } });
  });

  it("no interim percent when total missing or 0; success on complete", async () => {
    mockUploadMultipart.mockImplementation(async (opts) => {
      opts.onUploadProgress?.(progressEvent({ loaded: 10, total: undefined }));
      opts.onUploadProgress?.(progressEvent({ loaded: 20, total: 0 }));
      return {};
    });
    const { result } = renderHook(() => useMultipartUpload<Record<string, never>>());
    await act(async () => {
      await result.current.upload({ path: "/p", parts: [{ fieldName: "f", file: new Blob([]) }] });
    });
    expect(result.current.state).toEqual({ status: "success", data: {} });
  });

  it("user onUploadProgress callback fires too", async () => {
    const userCb = vi.fn();
    mockUploadMultipart.mockImplementation(async (opts) => {
      opts.onUploadProgress?.(progressEvent({ loaded: 3, total: 10 }));
      return null;
    });
    const { result } = renderHook(() => useMultipartUpload<null>());
    await act(async () => {
      await result.current.upload({
        path: "/p",
        parts: [{ fieldName: "f", file: new Blob([]) }],
        onUploadProgress: userCb,
      });
    });
    expect(userCb).toHaveBeenCalled();
    const ev = userCb.mock.calls[0]?.[0];
    expect(ev?.loaded).toBe(3);
    expect(ev?.total).toBe(10);
    expect(result.current.state).toEqual({ status: "success", data: null });
  });
});
