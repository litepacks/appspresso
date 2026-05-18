import type { FilesystemDirectory, FilesystemProviderConfig } from "./types";

export function joinFilesystemPath(
  basePath: string | undefined,
  path: string,
): string {
  const base = basePath?.replace(/^\/+|\/+$/g, "") ?? "";
  const rel = path.replace(/^\/+/, "");
  if (!base) return rel;
  if (!rel) return base;
  return `${base}/${rel}`;
}

export function resolveFilesystemLocation(
  config: FilesystemProviderConfig,
  path: string,
  directory?: FilesystemDirectory,
): { path: string; directory?: FilesystemDirectory } {
  return {
    path: joinFilesystemPath(config.basePath, path),
    directory: directory ?? config.defaultDirectory,
  };
}
