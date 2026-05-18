import { useCallback, useState } from "react";
import { uploadMultipart, type UploadMultipartOptions } from "@/api/upload";

export type MultipartUploadIdle = { status: "idle" };
export type MultipartUploadUploading = {
  status: "uploading";
  /** 0–100, undefined if unknown */
  progressPercent?: number;
};
export type MultipartUploadSuccess<T> = { status: "success"; data: T };
export type MultipartUploadError = { status: "error"; error: unknown };

export type MultipartUploadState<T = unknown> =
  | MultipartUploadIdle
  | MultipartUploadUploading
  | MultipartUploadSuccess<T>
  | MultipartUploadError;

/**
 * State + progress (percent) for `uploadMultipart`.
 */
export function useMultipartUpload<T = unknown>() {
  const [state, setState] = useState<MultipartUploadState<T>>({
    status: "idle",
  });

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const upload = useCallback(
    async (options: UploadMultipartOptions) => {
      const { onUploadProgress: userProgress, ...rest } = options;
      setState({ status: "uploading", progressPercent: undefined });
      try {
        const data = await uploadMultipart<T>({
          ...rest,
          onUploadProgress: (e) => {
            userProgress?.(e);
            if (e.total != null && e.total > 0) {
              setState({
                status: "uploading",
                progressPercent: Math.min(
                  100,
                  Math.round((e.loaded / e.total) * 100),
                ),
              });
            }
          },
        });
        setState({ status: "success", data });
        return data;
      } catch (error) {
        setState({ status: "error", error });
        throw error;
      }
    },
    [],
  );

  return { state, upload, reset };
}