/** Aligned with Capacitor `@capacitor/filesystem` — types are compile-only if peer is not installed. */
export type FilesystemDirectory =
  | "DOCUMENTS"
  | "DATA"
  | "LIBRARY"
  | "CACHE"
  | "EXTERNAL"
  | "EXTERNAL_STORAGE"
  | "TEMPORARY";

export type FilesystemEncoding = "utf8" | "ascii" | "utf16";

export type FilesystemProviderConfig = {
  /**
   * Default directory when `path` is provided.
   * E.g. `Directory.Data` → `"DATA"`.
   */
  defaultDirectory?: FilesystemDirectory;
  /** Prepended to all relative paths (e.g. `appspresso/logs/app.log`). */
  basePath?: string;
};

export type FilesystemScopedReadOptions = {
  directory?: FilesystemDirectory;
  encoding?: FilesystemEncoding;
};

export type FilesystemScopedWriteOptions = {
  directory?: FilesystemDirectory;
  encoding?: FilesystemEncoding;
  recursive?: boolean;
};

export type FilesystemReaddirEntry = {
  name: string;
  type: "file" | "directory";
  size: number;
  mtime: number;
  uri: string;
};
