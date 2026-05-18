import type { AxiosProgressEvent } from "axios";
import { http } from "@/api/http";

export type FileUploadPart = {
  /** `FormData` field name (e.g. `file`, `document`) */
  fieldName: string;
  file: File | Blob;
  /**
   * Meaningful for `Blob` only; filename sent to server.
   * Ignored for `File` (`File.name` is used).
   */
  filename?: string;
};

export type UploadMultipartOptions = {
  /** Path joined with `getEffectiveApiBaseUrl()`, e.g. `/v1/uploads` */
  path: string;
  parts: FileUploadPart[];
  /** Extra text fields (not JSON; plain `string`) */
  fields?: Record<string, string>;
  signal?: AbortSignal;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
};

/**
 * Uploads one or more files via `multipart/form-data`.
 * Auth and `baseURL` come from `http` interceptors.
 *
 * On native, files usually arrive as `Blob` / `File`
 * (e.g. Capacitor plugin); can use the same API.
 */
export async function uploadMultipart<T = unknown>(
  options: UploadMultipartOptions,
): Promise<T> {
  const { path, parts, fields, signal, onUploadProgress } = options;
  const form = new FormData();
  if (fields) {
    for (const [k, v] of Object.entries(fields)) {
      form.append(k, v);
    }
  }
  appendPartsToFormData(form, parts);

  const { data } = await http.post<T>(path, form, {
    signal,
    onUploadProgress,
    // Content-Type with boundary added by axios/network
  });
  return data;
}

export function appendPartsToFormData(
  form: FormData,
  parts: FileUploadPart[],
): void {
  for (const { fieldName, file, filename } of parts) {
    if (file instanceof File) {
      form.append(fieldName, file, file.name);
    } else {
      form.append(fieldName, file, filename ?? "upload.bin");
    }
  }
}

/** `File[]` from `<input type="file" />` (empty selection → `[]`). */
export function filesFromFileInput(input: HTMLInputElement): File[] {
  return input.files != null && input.files.length > 0
    ? Array.from(input.files)
    : [];
}

/**
 * Multiple files with same field name (one `append` per file).
 * Some backends expect repeated `files`, others `files[]` — set `fieldName` per server contract.
 */
export function filesToParts(
  files: File[],
  fieldName: string,
): FileUploadPart[] {
  return files.map((file) => ({ fieldName, file }));
}
