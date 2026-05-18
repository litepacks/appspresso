import type { AxiosProgressEvent } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "./http";
import {
  appendPartsToFormData,
  filesFromFileInput,
  filesToParts,
  uploadMultipart,
} from "./upload";

describe("upload helpers", () => {
  describe("appendPartsToFormData", () => {
    it("adds File field with File.name; uses given filename for Blob", () => {
      const form = new FormData();
      const file = new File(["x"], "a.txt", { type: "text/plain" });
      const blob = new Blob(["y"], { type: "application/octet-stream" });
      appendPartsToFormData(form, [
        { fieldName: "doc", file },
        { fieldName: "raw", file: blob, filename: "b.bin" },
      ]);
      const doc = form.get("doc");
      const raw = form.get("raw");
      expect(doc).toBeInstanceOf(File);
      // jsdom FormData.get often returns new File instance with same content
      expect((doc as File).name).toBe(file.name);
      expect((doc as File).size).toBe(file.size);
      expect(raw).toBeInstanceOf(Blob);
    });

    it("uses upload.bin when Blob and filename missing", () => {
      const form = new FormData();
      const blob = new Blob(["z"]);
      appendPartsToFormData(form, [{ fieldName: "bin", file: blob }]);
      expect(form.get("bin")).toBeInstanceOf(Blob);
    });

    it("appends multiple parts with same fieldName (multi file)", () => {
      const form = new FormData();
      const f1 = new File(["1"], "1.txt");
      const f2 = new File(["2"], "2.txt");
      appendPartsToFormData(form, [
        { fieldName: "files", file: f1 },
        { fieldName: "files", file: f2 },
      ]);
      const all = form.getAll("files");
      expect(all).toHaveLength(2);
      expect((all[0] as File).name).toBe(f1.name);
      expect((all[1] as File).name).toBe(f2.name);
    });

    it("FormData unchanged with empty parts (no field added)", () => {
      const form = new FormData();
      appendPartsToFormData(form, []);
      expect([...form.keys()].length).toBe(0);
    });
  });

  describe("filesToParts", () => {
    it("matches same fieldName", () => {
      const f1 = new File(["1"], "1.txt");
      const f2 = new File(["2"], "2.txt");
      const parts = filesToParts([f1, f2], "files");
      expect(parts).toHaveLength(2);
      expect(parts[0]?.fieldName).toBe("files");
      expect(parts[1]?.file).toBe(f2);
    });

    it("returns empty array", () => {
      expect(filesToParts([], "x")).toEqual([]);
    });
  });

  describe("filesFromFileInput", () => {
    it("empty array when no file selected", () => {
      const input = document.createElement("input");
      input.type = "file";
      expect(filesFromFileInput(input)).toEqual([]);
    });

    it("returns selected files as File[]", () => {
      const input = document.createElement("input");
      input.type = "file";
      const f1 = new File(["a"], "one.txt");
      const f2 = new File(["b"], "two.txt");
      // DataTransfer not always in jsdom; FileList-like object is enough
      const list = {
        length: 2,
        0: f1,
        1: f2,
        item(this: typeof list, i: number) {
          return i === 0 ? this[0] : i === 1 ? this[1] : null;
        },
      };
      Object.defineProperty(input, "files", {
        value: list,
        configurable: true,
      });
      const out = filesFromFileInput(input);
      expect(out).toEqual([f1, f2]);
    });
  });
});

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

describe("uploadMultipart", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("http.post sends FormData; fields on FormData", async () => {
    const spy = vi.spyOn(http, "post").mockResolvedValue({
      data: { id: 1 },
    } as never);
    const file = new File(["a"], "t.txt");
    const result = await uploadMultipart<{ id: number }>({
      path: "/upload",
      parts: [{ fieldName: "file", file }],
      fields: { kind: "avatar", scope: "user" },
    });
    expect(result).toEqual({ id: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toBe("/upload");
    expect(spy.mock.calls[0]?.[1]).toBeInstanceOf(FormData);
    const body = spy.mock.calls[0]?.[1] as FormData;
    expect(body.get("kind")).toBe("avatar");
    expect(body.get("scope")).toBe("user");
    expect(body.get("file")).toBeInstanceOf(File);
    const config = spy.mock.calls[0]?.[2];
    expect(config?.signal).toBeUndefined();
  });

  it("sends only parts without fields", async () => {
    const spy = vi.spyOn(http, "post").mockResolvedValue({ data: null } as never);
    await uploadMultipart({ path: "/only-file", parts: [{ fieldName: "f", file: new File([], "x") }] });
    const body = spy.mock.calls[0]?.[1] as FormData;
    expect(body.get("f")).toBeInstanceOf(File);
    expect([...body.keys()].sort()).toEqual(["f"]);
  });

  it("signal ve onUploadProgress http.post config’e iletilir", async () => {
    const spy = vi.spyOn(http, "post").mockResolvedValue({ data: {} } as never);
    const ac = new AbortController();
    const onUploadProgress = vi.fn();
    await uploadMultipart({
      path: "/p",
      parts: [],
      signal: ac.signal,
      onUploadProgress,
    });
    const config = spy.mock.calls[0]?.[2];
    expect(config?.signal).toBe(ac.signal);
    expect(config?.onUploadProgress).toBe(onUploadProgress);
    config?.onUploadProgress?.(progressEvent({ loaded: 1, total: 2 }));
    expect(onUploadProgress).toHaveBeenCalledTimes(1);
  });

  it("rethrows when http.post rejects", async () => {
    const err = new Error("network");
    vi.spyOn(http, "post").mockRejectedValue(err);
    await expect(
      uploadMultipart({ path: "/x", parts: [{ fieldName: "f", file: new Blob([]) }] }),
    ).rejects.toBe(err);
  });

  it("returns response body per generic type", async () => {
    vi.spyOn(http, "post").mockResolvedValue({
      data: { url: "https://cdn/x.png", bytes: 99 },
    } as never);
    const res = await uploadMultipart<{ url: string; bytes: number }>({
      path: "/media",
      parts: [{ fieldName: "i", file: new Blob([]) }],
    });
    expect(res).toEqual({ url: "https://cdn/x.png", bytes: 99 });
  });
});
